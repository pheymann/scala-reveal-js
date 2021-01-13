(function(){
'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */





// Get the environment info
var $env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
var $g =
  (typeof $env["global"] === "object" && $env["global"])
    ? $env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
$env["global"] = $g;




// Where to send exports



var $e =
  (typeof $env["exportsNamespace"] === "object" && $env["exportsNamespace"])
    ? $env["exportsNamespace"] : $g;

$env["exportsNamespace"] = $e;


// Freeze the environment info
$g["Object"]["freeze"]($env);

// Linking info - must be in sync with scala.scalajs.runtime.LinkingInfo
var $linkingInfo = {
  "envInfo": $env,
  "semantics": {




    "asInstanceOfs": 1,








    "arrayIndexOutOfBounds": 1,










    "moduleInit": 2,





    "strictFloats": false,




    "productionMode": false

  },



  "assumingES6": false,

  "linkerVersion": "0.6.33",
  "globalThis": this
};
$g["Object"]["freeze"]($linkingInfo);
$g["Object"]["freeze"]($linkingInfo["semantics"]);

// Snapshots of builtins and polyfills






var $imul = $g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

var $fround = $g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });


var $clz32 = $g["Math"]["clz32"] || (function(i) {
  // See Hacker's Delight, Section 5-3
  if (i === 0) return 32;
  var r = 1;
  if ((i & 0xffff0000) === 0) { i <<= 16; r += 16; };
  if ((i & 0xff000000) === 0) { i <<= 8; r += 8; };
  if ((i & 0xf0000000) === 0) { i <<= 4; r += 4; };
  if ((i & 0xc0000000) === 0) { i <<= 2; r += 2; };
  return r + (i >> 31);
});


// Other fields




















var $lastIDHash = 0; // last value attributed to an id hash code



var $idHashCodeMap = $g["WeakMap"] ? new $g["WeakMap"]() : null;



// Core mechanism

var $makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


var $makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      $throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
var $propertyName = function(obj) {
  for (var prop in obj)
    return prop;
};

// Runtime functions

var $isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


var $throwClassCastException = function(instance, classFullName) {




  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

var $throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  $throwClassCastException(instance, classArrayEncodedName);
};



var $throwArrayIndexOutOfBoundsException = function(i) {
  var msg = (i === null) ? null : ("" + i);



  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ArrayIndexOutOfBoundsException().init___T(msg));

};


var $noIsInstance = function(instance) {
  throw new $g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

var $makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

var $newArrayObject = function(arrayClassData, lengths) {
  return $newArrayObjectInternal(arrayClassData, lengths, 0);
};

var $newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = $newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

var $objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

var $objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return $d_T.getClassOf();
    case "number": {
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if ($isByte(v))
          return $d_jl_Byte.getClassOf();
        else if ($isShort(v))
          return $d_jl_Short.getClassOf();
        else
          return $d_jl_Integer.getClassOf();
      } else {
        if ($isFloat(instance))
          return $d_jl_Float.getClassOf();
        else
          return $d_jl_Double.getClassOf();
      }
    }
    case "boolean":
      return $d_jl_Boolean.getClassOf();
    case "undefined":
      return $d_sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        return instance.getClass__jl_Class();
      else if (instance instanceof $c_sjsr_RuntimeLong)
        return $d_jl_Long.getClassOf();
      else if ($isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

var $objectClone = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new $c_jl_CloneNotSupportedException().init___();
};

var $objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

var $objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

var $objectFinalize = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

var $objectEquals = function(instance, rhs) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && $numberEquals(instance, rhs);
  else
    return instance === rhs;
};

var $numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

var $objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return $m_sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return $m_sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if ($isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();

      else if ($idHashCodeMap === null)
        return 42;

      else
        return $systemIdentityHashCode(instance);
  }
};

var $comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      $as_T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      $asDouble(rhs);

      return $m_jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      $asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

var $charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return $uI(instance["length"]);



  else
    return instance.length__I();
};

var $charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return $uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

var $charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return $as_T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

var $booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

var $numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
var $numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
var $numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
var $numberLongValue = function(instance) {
  if (typeof instance === "number")
    return $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
var $numberFloatValue = function(instance) {
  if (typeof instance === "number") return $fround(instance);
  else                              return instance.floatValue__F();
};
var $numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

var $isNaN = function(instance) {
  return instance !== instance;
};

var $isInfinite = function(instance) {
  return !$g["isFinite"](instance) && !$isNaN(instance);
};

var $doubleToInt = function(x) {
  return (x > 2147483647) ? (2147483647) : ((x < -2147483648) ? -2147483648 : (x | 0));
};

/** Instantiates a JS object with variadic arguments to the constructor. */
var $newJSObjectWithVarargs = function(ctor, args) {
  // This basically emulates the ECMAScript specification for 'new'.
  var instance = $g["Object"]["create"](ctor.prototype);
  var result = ctor["apply"](instance, args);
  switch (typeof result) {
    case "string": case "number": case "boolean": case "undefined": case "symbol":
      return instance;
    default:
      return result === null ? instance : result;
  }
};

var $resolveSuperRef = function(initialProto, propName) {
  var getPrototypeOf = $g["Object"]["getPrototypeOf"];
  var getOwnPropertyDescriptor = $g["Object"]["getOwnPropertyDescriptor"];

  var superProto = getPrototypeOf(initialProto);
  while (superProto !== null) {
    var desc = getOwnPropertyDescriptor(superProto, propName);
    if (desc !== void 0)
      return desc;
    superProto = getPrototypeOf(superProto);
  }

  return void 0;
};

var $superGet = function(initialProto, self, propName) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var getter = desc["get"];
    if (getter !== void 0)
      return getter["call"](self);
    else
      return desc["value"];
  }
  return void 0;
};

var $superSet = function(initialProto, self, propName, value) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var setter = desc["set"];
    if (setter !== void 0) {
      setter["call"](self, value);
      return void 0;
    }
  }
  throw new $g["TypeError"]("super has no setter '" + propName + "'.");
};







var $propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

var $systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;


  if (srcPos < 0 || destPos < 0 || length < 0 ||
      (srcPos > ((srcu.length - length) | 0)) ||
      (destPos > ((destu.length - length) | 0))) {
    $throwArrayIndexOutOfBoundsException(null);
  }


  if (srcu !== destu || destPos < srcPos || (((srcPos + length) | 0) < destPos)) {
    for (var i = 0; i < length; i = (i + 1) | 0)
      destu[(destPos + i) | 0] = srcu[(srcPos + i) | 0];
  } else {
    for (var i = (length - 1) | 0; i >= 0; i = (i - 1) | 0)
      destu[(destPos + i) | 0] = srcu[(srcPos + i) | 0];
  }
};

var $systemIdentityHashCode =

  ($idHashCodeMap !== null) ?

  (function(obj) {
    switch (typeof obj) {
      case "string": case "number": case "boolean": case "undefined":
        return $objectHashCode(obj);
      default:
        if (obj === null) {
          return 0;
        } else {
          var hash = $idHashCodeMap["get"](obj);
          if (hash === void 0) {
            hash = ($lastIDHash + 1) | 0;
            $lastIDHash = hash;
            $idHashCodeMap["set"](obj, hash);
          }
          return hash;
        }
    }

  }) :
  (function(obj) {
    if ($isScalaJSObject(obj)) {
      var hash = obj["$idHashCode$0"];
      if (hash !== void 0) {
        return hash;
      } else if (!$g["Object"]["isSealed"](obj)) {
        hash = ($lastIDHash + 1) | 0;
        $lastIDHash = hash;
        obj["$idHashCode$0"] = hash;
        return hash;
      } else {
        return 42;
      }
    } else if (obj === null) {
      return 0;
    } else {
      return $objectHashCode(obj);
    }

  });

// is/as for hijacked boxed classes (the non-trivial ones)

var $isByte = function(v) {
  return typeof v === "number" && (v << 24 >> 24) === v && 1/v !== 1/-0;
};

var $isShort = function(v) {
  return typeof v === "number" && (v << 16 >> 16) === v && 1/v !== 1/-0;
};

var $isInt = function(v) {
  return typeof v === "number" && (v | 0) === v && 1/v !== 1/-0;
};

var $isFloat = function(v) {



  return typeof v === "number";

};


var $asUnit = function(v) {
  if (v === void 0 || v === null)
    return v;
  else
    $throwClassCastException(v, "scala.runtime.BoxedUnit");
};

var $asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Boolean");
};

var $asByte = function(v) {
  if ($isByte(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Byte");
};

var $asShort = function(v) {
  if ($isShort(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Short");
};

var $asInt = function(v) {
  if ($isInt(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Integer");
};

var $asFloat = function(v) {
  if ($isFloat(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Float");
};

var $asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Double");
};


// Unboxes


var $uZ = function(value) {
  return !!$asBoolean(value);
};
var $uB = function(value) {
  return $asByte(value) | 0;
};
var $uS = function(value) {
  return $asShort(value) | 0;
};
var $uI = function(value) {
  return $asInt(value) | 0;
};
var $uJ = function(value) {
  return null === value ? $m_sjsr_RuntimeLong$().Zero$1
                        : $as_sjsr_RuntimeLong(value);
};
var $uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float.
   */
  return +$asFloat(value);
};
var $uD = function(value) {
  return +$asDouble(value);
};






// TypeArray conversions

var $byteArray2TypedArray = function(value) { return new $g["Int8Array"](value.u); };
var $shortArray2TypedArray = function(value) { return new $g["Int16Array"](value.u); };
var $charArray2TypedArray = function(value) { return new $g["Uint16Array"](value.u); };
var $intArray2TypedArray = function(value) { return new $g["Int32Array"](value.u); };
var $floatArray2TypedArray = function(value) { return new $g["Float32Array"](value.u); };
var $doubleArray2TypedArray = function(value) { return new $g["Float64Array"](value.u); };

var $typedArray2ByteArray = function(value) {
  var arrayClassData = $d_B.getArrayOf();
  return new arrayClassData.constr(new $g["Int8Array"](value));
};
var $typedArray2ShortArray = function(value) {
  var arrayClassData = $d_S.getArrayOf();
  return new arrayClassData.constr(new $g["Int16Array"](value));
};
var $typedArray2CharArray = function(value) {
  var arrayClassData = $d_C.getArrayOf();
  return new arrayClassData.constr(new $g["Uint16Array"](value));
};
var $typedArray2IntArray = function(value) {
  var arrayClassData = $d_I.getArrayOf();
  return new arrayClassData.constr(new $g["Int32Array"](value));
};
var $typedArray2FloatArray = function(value) {
  var arrayClassData = $d_F.getArrayOf();
  return new arrayClassData.constr(new $g["Float32Array"](value));
};
var $typedArray2DoubleArray = function(value) {
  var arrayClassData = $d_D.getArrayOf();
  return new arrayClassData.constr(new $g["Float64Array"](value));
};

// TypeData class


/** @constructor */
var $TypeData = function() {




  // Runtime support
  this.constr = void 0;
  this.parentData = void 0;
  this.ancestors = null;
  this.componentData = null;
  this.arrayBase = null;
  this.arrayDepth = 0;
  this.zero = null;
  this.arrayEncodedName = "";
  this._classOf = void 0;
  this._arrayOf = void 0;
  this.isArrayOf = void 0;

  // java.lang.Class support
  this["name"] = "";
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isRawJSType"] = false;
  this["isInstance"] = void 0;
};


$TypeData.prototype.initPrim = function(



    zero, arrayEncodedName, displayName) {
  // Runtime support
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInstance"] = function(obj) { return false; };

  return this;
};


$TypeData.prototype.initClass = function(



    internalNameObj, isInterface, fullName,
    ancestors, isRawJSType, parentData, isInstance, isArrayOf) {
  var internalName = $propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.arrayEncodedName = "L"+fullName+";";
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isInterface"] = isInterface;
  this["isRawJSType"] = !!isRawJSType;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.initArray = function(



    componentData) {
  // The constructor

  var componentZero0 = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  var componentZero = (componentZero0 == "longZero")
    ? $m_sjsr_RuntimeLong$().Zero$1
    : componentZero0;


  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new $h_O;
  ArrayClass.prototype.constructor = ArrayClass;


  ArrayClass.prototype.get = function(i) {
    if (i < 0 || i >= this.u.length)
      $throwArrayIndexOutOfBoundsException(i);
    return this.u[i];
  };
  ArrayClass.prototype.set = function(i, v) {
    if (i < 0 || i >= this.u.length)
      $throwArrayIndexOutOfBoundsException(i);
    this.u[i] = v;
  };


  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(new this.u.constructor(this.u));
  };






































  ArrayClass.prototype.$classData = this;

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var arrayDepth = componentData.arrayDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = $d_O;
  this.ancestors = {O: 1, jl_Cloneable: 1, Ljava_io_Serializable: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.getClassOf = function() {



  if (!this._classOf)
    this._classOf = new $c_jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};


$TypeData.prototype.getArrayOf = function() {



  if (!this._arrayOf)
    this._arrayOf = new $TypeData().initArray(this);
  return this._arrayOf;
};

// java.lang.Class support


$TypeData.prototype["getFakeInstance"] = function() {



  if (this === $d_T)
    return "some string";
  else if (this === $d_jl_Boolean)
    return false;
  else if (this === $d_jl_Byte ||
           this === $d_jl_Short ||
           this === $d_jl_Integer ||
           this === $d_jl_Float ||
           this === $d_jl_Double)
    return 0;
  else if (this === $d_jl_Long)
    return $m_sjsr_RuntimeLong$().Zero$1;
  else if (this === $d_sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};


$TypeData.prototype["getSuperclass"] = function() {



  return this.parentData ? this.parentData.getClassOf() : null;
};


$TypeData.prototype["getComponentType"] = function() {



  return this.componentData ? this.componentData.getClassOf() : null;
};


$TypeData.prototype["newArrayOfThisClass"] = function(lengths) {



  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return $newArrayObject(arrayClassData, lengths);
};




// Create primitive types

var $d_V = new $TypeData().initPrim(undefined, "V", "void");
var $d_Z = new $TypeData().initPrim(false, "Z", "boolean");
var $d_C = new $TypeData().initPrim(0, "C", "char");
var $d_B = new $TypeData().initPrim(0, "B", "byte");
var $d_S = new $TypeData().initPrim(0, "S", "short");
var $d_I = new $TypeData().initPrim(0, "I", "int");
var $d_J = new $TypeData().initPrim("longZero", "J", "long");
var $d_F = new $TypeData().initPrim(0.0, "F", "float");
var $d_D = new $TypeData().initPrim(0.0, "D", "double");

// Instance tests for array of primitives

var $isArrayOf_Z = $makeIsArrayOfPrimitive($d_Z);
$d_Z.isArrayOf = $isArrayOf_Z;

var $isArrayOf_C = $makeIsArrayOfPrimitive($d_C);
$d_C.isArrayOf = $isArrayOf_C;

var $isArrayOf_B = $makeIsArrayOfPrimitive($d_B);
$d_B.isArrayOf = $isArrayOf_B;

var $isArrayOf_S = $makeIsArrayOfPrimitive($d_S);
$d_S.isArrayOf = $isArrayOf_S;

var $isArrayOf_I = $makeIsArrayOfPrimitive($d_I);
$d_I.isArrayOf = $isArrayOf_I;

var $isArrayOf_J = $makeIsArrayOfPrimitive($d_J);
$d_J.isArrayOf = $isArrayOf_J;

var $isArrayOf_F = $makeIsArrayOfPrimitive($d_F);
$d_F.isArrayOf = $isArrayOf_F;

var $isArrayOf_D = $makeIsArrayOfPrimitive($d_D);
$d_D.isArrayOf = $isArrayOf_D;


// asInstanceOfs for array of primitives
var $asArrayOf_Z = $makeAsArrayOfPrimitive($isArrayOf_Z, "Z");
var $asArrayOf_C = $makeAsArrayOfPrimitive($isArrayOf_C, "C");
var $asArrayOf_B = $makeAsArrayOfPrimitive($isArrayOf_B, "B");
var $asArrayOf_S = $makeAsArrayOfPrimitive($isArrayOf_S, "S");
var $asArrayOf_I = $makeAsArrayOfPrimitive($isArrayOf_I, "I");
var $asArrayOf_J = $makeAsArrayOfPrimitive($isArrayOf_J, "J");
var $asArrayOf_F = $makeAsArrayOfPrimitive($isArrayOf_F, "F");
var $asArrayOf_D = $makeAsArrayOfPrimitive($isArrayOf_D, "D");

function $f_F1__compose__F1__F1($thiz, g) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, g$1) {
    return (function(x$2) {
      return $this.apply__O__O(g$1.apply__O__O(x$2))
    })
  })($thiz, g))
}
function $is_F1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.F1)))
}
function $as_F1(obj) {
  return (($is_F1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Function1"))
}
function $isArrayOf_F1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.F1)))
}
function $asArrayOf_F1(obj, depth) {
  return (($isArrayOf_F1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Function1;", depth))
}
function $is_F2(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.F2)))
}
function $as_F2(obj) {
  return (($is_F2(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Function2"))
}
function $isArrayOf_F2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.F2)))
}
function $asArrayOf_F2(obj, depth) {
  return (($isArrayOf_F2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Function2;", depth))
}
function $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot($thiz) {
  return $as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot($thiz.raw__Ljapgolly_scalajs_react_raw_React$Component().mountedImpure)
}
function $f_Ljapgolly_scalajs_react_internal_JsRepr__unsafeFromJs__sjs_js_Any__O($thiz, u) {
  return $thiz.fromJs$1.apply__O__O(u)
}
function $is_Ljapgolly_scalajs_react_vdom_Builder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_Builder)))
}
function $as_Ljapgolly_scalajs_react_vdom_Builder(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_Builder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.Builder"))
}
function $isArrayOf_Ljapgolly_scalajs_react_vdom_Builder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_Builder)))
}
function $asArrayOf_Ljapgolly_scalajs_react_vdom_Builder(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_Builder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.Builder;", depth))
}
function $f_Ljapgolly_scalajs_react_vdom_HtmlAttrs__$$init$__V($thiz) {
  $thiz.key$1 = $m_Ljapgolly_scalajs_react_vdom_Attr$Key$();
  $thiz.onChange$1 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Event().init___T("onChange");
  $thiz.onClick$1 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Event().init___T("onClick");
  $thiz.onClickCapture$1 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Event().init___T("onClickCapture");
  $thiz.src$1 = ($m_Ljapgolly_scalajs_react_vdom_PackageBase$(), new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("src"));
  $thiz.title$1 = ($m_Ljapgolly_scalajs_react_vdom_PackageBase$(), new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("title"));
  $thiz.type$1 = ($m_Ljapgolly_scalajs_react_vdom_PackageBase$(), new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("type"));
  $thiz.value$1 = ($m_Ljapgolly_scalajs_react_vdom_PackageBase$(), new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("value"))
}
function $f_Ljapgolly_scalajs_react_vdom_HtmlTags__br__T($thiz) {
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var $$this = "br";
  return $$this
}
function $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1__vdomAttrVtKey__F1__F2($thiz, k) {
  $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$();
  var fn = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this, k$1) {
    return (function(b$2, a$2) {
      var b = $as_F1(b$2);
      b.apply__O__O(k$1.apply__O__O(a$2))
    })
  })($thiz, k));
  return fn
}
function $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1__$$init$__V($thiz) {
  $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$();
  var fn = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this) {
    return (function(b$2, a$2) {
      var b = $as_F1(b$2);
      var t = $uJ(a$2);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var s = $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(lo, hi);
      b.apply__O__O(s)
    })
  })($thiz));
  $thiz.vdomAttrVtKeyL$2 = fn;
  var k = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1) {
    return (function(a$3$2) {
      var a$3 = $as_T(a$3$2);
      return a$3
    })
  })($thiz));
  $thiz.vdomAttrVtKeyS$2 = $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1__vdomAttrVtKey__F1__F2($thiz, k)
}
function $is_Ljapgolly_scalajs_react_vdom_TagMod(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_TagMod)))
}
function $as_Ljapgolly_scalajs_react_vdom_TagMod(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_TagMod(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.TagMod"))
}
function $isArrayOf_Ljapgolly_scalajs_react_vdom_TagMod(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_TagMod)))
}
function $asArrayOf_Ljapgolly_scalajs_react_vdom_TagMod(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_TagMod(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.TagMod;", depth))
}
/** @constructor */
function $c_O() {
  /*<skip>*/
}
/** @constructor */
function $h_O() {
  /*<skip>*/
}
$h_O.prototype = $c_O.prototype;
$c_O.prototype.init___ = (function() {
  return this
});
$c_O.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_O.prototype.toString__T = (function() {
  var jsx$2 = $objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = $uD((i >>> 0));
  var jsx$1 = x.toString(16);
  return ((jsx$2 + "@") + $as_T(jsx$1))
});
$c_O.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
$c_O.prototype.toString = (function() {
  return this.toString__T()
});
function $is_O(obj) {
  return (obj !== null)
}
function $as_O(obj) {
  return obj
}
function $isArrayOf_O(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase.isPrimitive)))
  }
}
function $asArrayOf_O(obj, depth) {
  return (($isArrayOf_O(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Object;", depth))
}
var $d_O = new $TypeData().initClass({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), (void 0), $is_O, $isArrayOf_O);
$c_O.prototype.$classData = $d_O;
function $is_ju_Map(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.ju_Map)))
}
function $as_ju_Map(obj) {
  return (($is_ju_Map(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.util.Map"))
}
function $isArrayOf_ju_Map(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.ju_Map)))
}
function $asArrayOf_ju_Map(obj, depth) {
  return (($isArrayOf_ju_Map(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.util.Map;", depth))
}
function $is_ju_Map$Entry(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.ju_Map$Entry)))
}
function $as_ju_Map$Entry(obj) {
  return (($is_ju_Map$Entry(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.util.Map$Entry"))
}
function $isArrayOf_ju_Map$Entry(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.ju_Map$Entry)))
}
function $asArrayOf_ju_Map$Entry(obj, depth) {
  return (($isArrayOf_ju_Map$Entry(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.util.Map$Entry;", depth))
}
function $is_sc_IterableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IterableOnce)))
}
function $as_sc_IterableOnce(obj) {
  return (($is_sc_IterableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IterableOnce"))
}
function $isArrayOf_sc_IterableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IterableOnce)))
}
function $asArrayOf_sc_IterableOnce(obj, depth) {
  return (($isArrayOf_sc_IterableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IterableOnce;", depth))
}
function $f_sc_IterableOnceOps__copyToArray__O__I__I__I($thiz, xs, start, len) {
  var it = $as_sc_IterableOnce($thiz).iterator__sc_Iterator();
  var i = start;
  var y = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = ((start + ((len < y) ? len : y)) | 0);
  while (((i < end) && it.hasNext__Z())) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, it.next__O());
    i = ((1 + i) | 0)
  };
  return ((i - start) | 0)
}
function $f_sc_IterableOnceOps__isEmpty__Z($thiz) {
  return (!$as_sc_IterableOnce($thiz).iterator__sc_Iterator().hasNext__Z())
}
function $f_sc_IterableOnceOps__mkString__T__T__T__T($thiz, start, sep, end) {
  if ($thiz.isEmpty__Z()) {
    return (("" + start) + end)
  } else {
    var this$1 = $thiz.addString__scm_StringBuilder__T__T__T__scm_StringBuilder(new $c_scm_StringBuilder().init___(), start, sep, end);
    return this$1.underlying$4.java$lang$StringBuilder$$content$f
  }
}
function $f_sc_IterableOnceOps__foreach__F1__V($thiz, f) {
  var it = $as_sc_IterableOnce($thiz).iterator__sc_Iterator();
  while (it.hasNext__Z()) {
    f.apply__O__O(it.next__O())
  }
}
function $f_sc_IterableOnceOps__copyToArray__O__I__I($thiz, xs, start) {
  var xsLen = $m_sr_ScalaRunTime$().array$undlength__O__I(xs);
  var it = $as_sc_IterableOnce($thiz).iterator__sc_Iterator();
  var i = start;
  while (((i < xsLen) && it.hasNext__Z())) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, it.next__O());
    i = ((1 + i) | 0)
  };
  return ((i - start) | 0)
}
function $f_sc_IterableOnceOps__size__I($thiz) {
  if (($as_sc_IterableOnce($thiz).knownSize__I() >= 0)) {
    return $as_sc_IterableOnce($thiz).knownSize__I()
  } else {
    var it = $as_sc_IterableOnce($thiz).iterator__sc_Iterator();
    var len = 0;
    while (it.hasNext__Z()) {
      len = ((1 + len) | 0);
      it.next__O()
    };
    return len
  }
}
function $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder($thiz, b, start, sep, end) {
  var jsb = b.underlying$4;
  if (($uI(start.length) !== 0)) {
    jsb.java$lang$StringBuilder$$content$f = (("" + jsb.java$lang$StringBuilder$$content$f) + start)
  };
  var it = $as_sc_IterableOnce($thiz).iterator__sc_Iterator();
  if (it.hasNext__Z()) {
    var obj = it.next__O();
    jsb.java$lang$StringBuilder$$content$f = (("" + jsb.java$lang$StringBuilder$$content$f) + obj);
    while (it.hasNext__Z()) {
      jsb.java$lang$StringBuilder$$content$f = (("" + jsb.java$lang$StringBuilder$$content$f) + sep);
      var obj$1 = it.next__O();
      jsb.java$lang$StringBuilder$$content$f = (("" + jsb.java$lang$StringBuilder$$content$f) + obj$1)
    }
  };
  if (($uI(end.length) !== 0)) {
    jsb.java$lang$StringBuilder$$content$f = (("" + jsb.java$lang$StringBuilder$$content$f) + end)
  };
  return b
}
function $f_sc_IterableOnceOps__nonEmpty__Z($thiz) {
  return (!$thiz.isEmpty__Z())
}
function $is_sc_IterableOnceOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IterableOnceOps)))
}
function $as_sc_IterableOnceOps(obj) {
  return (($is_sc_IterableOnceOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IterableOnceOps"))
}
function $isArrayOf_sc_IterableOnceOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IterableOnceOps)))
}
function $asArrayOf_sc_IterableOnceOps(obj, depth) {
  return (($isArrayOf_sc_IterableOnceOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IterableOnceOps;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_Callback$() {
  $c_O.call(this);
  this.empty$1 = null
}
$c_Ljapgolly_scalajs_react_Callback$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_Callback$.prototype.constructor = $c_Ljapgolly_scalajs_react_Callback$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_Callback$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_Callback$.prototype = $c_Ljapgolly_scalajs_react_Callback$.prototype;
$c_Ljapgolly_scalajs_react_Callback$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_Callback$ = this;
  this.empty$1 = $m_Ljapgolly_scalajs_react_CallbackTo$().pure__O__F0((void 0));
  return this
});
var $d_Ljapgolly_scalajs_react_Callback$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_Callback$: 0
}, false, "japgolly.scalajs.react.Callback$", {
  Ljapgolly_scalajs_react_Callback$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_Callback$.prototype.$classData = $d_Ljapgolly_scalajs_react_Callback$;
var $n_Ljapgolly_scalajs_react_Callback$ = (void 0);
function $m_Ljapgolly_scalajs_react_Callback$() {
  if ((!$n_Ljapgolly_scalajs_react_Callback$)) {
    $n_Ljapgolly_scalajs_react_Callback$ = new $c_Ljapgolly_scalajs_react_Callback$().init___()
  };
  return $n_Ljapgolly_scalajs_react_Callback$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_CallbackTo() {
  $c_O.call(this);
  this.japgolly$scalajs$react$CallbackTo$$f$1 = null
}
$c_Ljapgolly_scalajs_react_CallbackTo.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CallbackTo.prototype.constructor = $c_Ljapgolly_scalajs_react_CallbackTo;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CallbackTo() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CallbackTo.prototype = $c_Ljapgolly_scalajs_react_CallbackTo.prototype;
$c_Ljapgolly_scalajs_react_CallbackTo.prototype.init___F0 = (function(f) {
  this.japgolly$scalajs$react$CallbackTo$$f$1 = f;
  return this
});
$c_Ljapgolly_scalajs_react_CallbackTo.prototype.equals__O__Z = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_CallbackTo$().equals$extension__F0__O__Z(this.japgolly$scalajs$react$CallbackTo$$f$1, x$1)
});
$c_Ljapgolly_scalajs_react_CallbackTo.prototype.hashCode__I = (function() {
  var $$this = this.japgolly$scalajs$react$CallbackTo$$f$1;
  return $systemIdentityHashCode($$this)
});
function $as_Ljapgolly_scalajs_react_CallbackTo(obj) {
  return (((obj instanceof $c_Ljapgolly_scalajs_react_CallbackTo) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.CallbackTo"))
}
function $isArrayOf_Ljapgolly_scalajs_react_CallbackTo(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_CallbackTo)))
}
function $asArrayOf_Ljapgolly_scalajs_react_CallbackTo(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_CallbackTo(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.CallbackTo;", depth))
}
var $d_Ljapgolly_scalajs_react_CallbackTo = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CallbackTo: 0
}, false, "japgolly.scalajs.react.CallbackTo", {
  Ljapgolly_scalajs_react_CallbackTo: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_CallbackTo.prototype.$classData = $d_Ljapgolly_scalajs_react_CallbackTo;
/** @constructor */
function $c_Ljapgolly_scalajs_react_CallbackTo$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.constructor = $c_Ljapgolly_scalajs_react_CallbackTo$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CallbackTo$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CallbackTo$.prototype = $c_Ljapgolly_scalajs_react_CallbackTo$.prototype;
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.equals$extension__F0__O__Z = (function($$this, x$1) {
  if ((x$1 instanceof $c_Ljapgolly_scalajs_react_CallbackTo)) {
    var CallbackTo$1 = ((x$1 === null) ? null : $as_Ljapgolly_scalajs_react_CallbackTo(x$1).japgolly$scalajs$react$CallbackTo$$f$1);
    return ($$this === CallbackTo$1)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.toJsFn$extension__F0__sjs_js_Function0 = (function($$this) {
  return (function(f) {
    return (function() {
      return f.apply__O()
    })
  })($$this)
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.pure__O__F0 = (function(a) {
  return new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, a$1) {
    return (function() {
      return a$1
    })
  })(this, a))
});
var $d_Ljapgolly_scalajs_react_CallbackTo$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CallbackTo$: 0
}, false, "japgolly.scalajs.react.CallbackTo$", {
  Ljapgolly_scalajs_react_CallbackTo$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.$classData = $d_Ljapgolly_scalajs_react_CallbackTo$;
var $n_Ljapgolly_scalajs_react_CallbackTo$ = (void 0);
function $m_Ljapgolly_scalajs_react_CallbackTo$() {
  if ((!$n_Ljapgolly_scalajs_react_CallbackTo$)) {
    $n_Ljapgolly_scalajs_react_CallbackTo$ = new $c_Ljapgolly_scalajs_react_CallbackTo$().init___()
  };
  return $n_Ljapgolly_scalajs_react_CallbackTo$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_CtorType.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CtorType.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType.prototype = $c_Ljapgolly_scalajs_react_CtorType.prototype;
function $as_Ljapgolly_scalajs_react_CtorType(obj) {
  return (((obj instanceof $c_Ljapgolly_scalajs_react_CtorType) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.CtorType"))
}
function $isArrayOf_Ljapgolly_scalajs_react_CtorType(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_CtorType)))
}
function $asArrayOf_Ljapgolly_scalajs_react_CtorType(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_CtorType(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.CtorType;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$Summoner$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$Summoner$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$Summoner$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype = $c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype;
$c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype.summonN__Ljapgolly_scalajs_react_internal_Singleton__Ljapgolly_scalajs_react_CtorType$Summoner = (function(s) {
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, s$1) {
    return (function(rc$2) {
      return new $c_Ljapgolly_scalajs_react_CtorType$Nullary().init___O__F1__sjs_js_UndefOr($g.React.createElement(rc$2, s$1.value$1), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, rc, s$1$1) {
        return (function(m$2) {
          var m = $as_Ljapgolly_scalajs_react_CtorType$Mod(m$2).mod$1;
          return $g.React.createElement(rc, $m_Ljapgolly_scalajs_react_CtorType$Mod$().applyAndCast$extension__F1__sjs_js_Object__sjs_js_Object(m, s$1$1.mutableObj$1.apply__O()))
        })
      })($this, rc$2, s$1)), (void 0))
    })
  })(this, s));
  var p = $m_Ljapgolly_scalajs_react_CtorType$ProfunctorN$();
  return new $c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1().init___F1__Ljapgolly_scalajs_react_internal_Profunctor(f, p)
});
var $d_Ljapgolly_scalajs_react_CtorType$Summoner$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$Summoner$: 0
}, false, "japgolly.scalajs.react.CtorType$Summoner$", {
  Ljapgolly_scalajs_react_CtorType$Summoner$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$Summoner$;
var $n_Ljapgolly_scalajs_react_CtorType$Summoner$ = (void 0);
function $m_Ljapgolly_scalajs_react_CtorType$Summoner$() {
  if ((!$n_Ljapgolly_scalajs_react_CtorType$Summoner$)) {
    $n_Ljapgolly_scalajs_react_CtorType$Summoner$ = new $c_Ljapgolly_scalajs_react_CtorType$Summoner$().init___()
  };
  return $n_Ljapgolly_scalajs_react_CtorType$Summoner$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Generic$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_Generic$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Generic$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Generic$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Generic$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Generic$.prototype = $c_Ljapgolly_scalajs_react_component_Generic$.prototype;
$c_Ljapgolly_scalajs_react_component_Generic$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_component_Generic$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Generic$: 0
}, false, "japgolly.scalajs.react.component.Generic$", {
  Ljapgolly_scalajs_react_component_Generic$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_Generic$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Generic$;
var $n_Ljapgolly_scalajs_react_component_Generic$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_Generic$() {
  if ((!$n_Ljapgolly_scalajs_react_component_Generic$)) {
    $n_Ljapgolly_scalajs_react_component_Generic$ = new $c_Ljapgolly_scalajs_react_component_Generic$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_Generic$
}
function $f_Ljapgolly_scalajs_react_component_Generic$UnmountedSimple__renderIntoDOM__sjs_js_$bar__F0__O($thiz, container, callback) {
  return $thiz.mountRaw__F1().apply__O__O($g.ReactDOM.render($thiz.raw__Ljapgolly_scalajs_react_raw_React$ComponentElement(), container, $m_Ljapgolly_scalajs_react_CallbackTo$().toJsFn$extension__F0__sjs_js_Function0(callback)))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_JsForwardRef$() {
  $c_O.call(this);
  this.japgolly$scalajs$react$component$JsForwardRef$$constUnit$1 = null
}
$c_Ljapgolly_scalajs_react_component_JsForwardRef$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_JsForwardRef$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_JsForwardRef$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_JsForwardRef$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_JsForwardRef$.prototype = $c_Ljapgolly_scalajs_react_component_JsForwardRef$.prototype;
$c_Ljapgolly_scalajs_react_component_JsForwardRef$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_component_JsForwardRef$ = this;
  this.japgolly$scalajs$react$component$JsForwardRef$$constUnit$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2$2) {
      return (void 0)
    })
  })(this));
  return this
});
var $d_Ljapgolly_scalajs_react_component_JsForwardRef$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_JsForwardRef$: 0
}, false, "japgolly.scalajs.react.component.JsForwardRef$", {
  Ljapgolly_scalajs_react_component_JsForwardRef$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_JsForwardRef$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_JsForwardRef$;
var $n_Ljapgolly_scalajs_react_component_JsForwardRef$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_JsForwardRef$() {
  if ((!$n_Ljapgolly_scalajs_react_component_JsForwardRef$)) {
    $n_Ljapgolly_scalajs_react_component_JsForwardRef$ = new $c_Ljapgolly_scalajs_react_component_JsForwardRef$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_JsForwardRef$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Scala$() {
  $c_O.call(this);
  this.builder$1 = null;
  this.Lifecycle$1 = null
}
$c_Ljapgolly_scalajs_react_component_Scala$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Scala$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Scala$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Scala$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Scala$.prototype = $c_Ljapgolly_scalajs_react_component_Scala$.prototype;
$c_Ljapgolly_scalajs_react_component_Scala$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_component_Scala$ = this;
  this.builder$1 = $m_Ljapgolly_scalajs_react_component_builder_EntryPoint$();
  this.Lifecycle$1 = $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$();
  return this
});
var $d_Ljapgolly_scalajs_react_component_Scala$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Scala$: 0
}, false, "japgolly.scalajs.react.component.Scala$", {
  Ljapgolly_scalajs_react_component_Scala$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_Scala$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Scala$;
var $n_Ljapgolly_scalajs_react_component_Scala$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_Scala$() {
  if ((!$n_Ljapgolly_scalajs_react_component_Scala$)) {
    $n_Ljapgolly_scalajs_react_component_Scala$ = new $c_Ljapgolly_scalajs_react_component_Scala$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_Scala$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaFn$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_ScalaFn$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaFn$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaFn$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaFn$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaFn$.prototype = $c_Ljapgolly_scalajs_react_component_ScalaFn$.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaFn$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_component_ScalaFn$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaFn$: 0
}, false, "japgolly.scalajs.react.component.ScalaFn$", {
  Ljapgolly_scalajs_react_component_ScalaFn$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaFn$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaFn$;
var $n_Ljapgolly_scalajs_react_component_ScalaFn$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_ScalaFn$() {
  if ((!$n_Ljapgolly_scalajs_react_component_ScalaFn$)) {
    $n_Ljapgolly_scalajs_react_component_ScalaFn$ = new $c_Ljapgolly_scalajs_react_component_ScalaFn$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_ScalaFn$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaForwardRef$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_ScalaForwardRef$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaForwardRef$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaForwardRef$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaForwardRef$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaForwardRef$.prototype = $c_Ljapgolly_scalajs_react_component_ScalaForwardRef$.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaForwardRef$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_component_ScalaForwardRef$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaForwardRef$: 0
}, false, "japgolly.scalajs.react.component.ScalaForwardRef$", {
  Ljapgolly_scalajs_react_component_ScalaForwardRef$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaForwardRef$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaForwardRef$;
var $n_Ljapgolly_scalajs_react_component_ScalaForwardRef$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_ScalaForwardRef$() {
  if ((!$n_Ljapgolly_scalajs_react_component_ScalaForwardRef$)) {
    $n_Ljapgolly_scalajs_react_component_ScalaForwardRef$ = new $c_Ljapgolly_scalajs_react_component_ScalaForwardRef$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_ScalaForwardRef$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Builder$() {
  $c_O.call(this);
  this.japgolly$scalajs$react$component$builder$Builder$$InitStateUnit$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Builder$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Builder$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Builder$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Builder$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Builder$.prototype = $c_Ljapgolly_scalajs_react_component_builder_Builder$.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Builder$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_component_builder_Builder$ = this;
  this.japgolly$scalajs$react$component$builder$Builder$$InitStateUnit$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$1$2) {
      return $m_Ljapgolly_scalajs_react_internal_Box$().Unit$1
    })
  })(this));
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$.prototype.fromReactComponentClass__sjs_js_Function1__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(rc, ctorType) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  var x = $m_Ljapgolly_scalajs_react_component_Js$().component__sjs_js_Function1__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot(rc, ctorType);
  return x.cmapCtorProps__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$16$2) {
      $m_Ljapgolly_scalajs_react_internal_Box$();
      return {
        "a": x$16$2
      }
    })
  })(this))).mapUnmounted__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1) {
    return (function(x$17$2) {
      var x$17 = $as_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(x$17$2);
      return x$17.mapUnmountedProps__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1) {
        return (function(x$18$2) {
          return x$18$2.a
        })
      })(this$2$1))).mapMounted__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$2) {
        return (function(x$2) {
          var x$1 = $as_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(x$2);
          $m_Ljapgolly_scalajs_react_component_Scala$();
          return new $c_Ljapgolly_scalajs_react_component_Scala$$anon$1().init___Ljapgolly_scalajs_react_component_Js$MountedWithRoot(x$1)
        })
      })(this$2$1)))
    })
  })(this)))
});
var $d_Ljapgolly_scalajs_react_component_builder_Builder$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Builder$: 0
}, false, "japgolly.scalajs.react.component.builder.Builder$", {
  Ljapgolly_scalajs_react_component_builder_Builder$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Builder$;
var $n_Ljapgolly_scalajs_react_component_builder_Builder$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_builder_Builder$() {
  if ((!$n_Ljapgolly_scalajs_react_component_builder_Builder$)) {
    $n_Ljapgolly_scalajs_react_component_builder_Builder$ = new $c_Ljapgolly_scalajs_react_component_builder_Builder$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_builder_Builder$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Builder$Step1() {
  $c_O.call(this);
  this.name$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step1.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step1.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Builder$Step1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Builder$Step1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Builder$Step1.prototype = $c_Ljapgolly_scalajs_react_component_builder_Builder$Step1.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step1.prototype.stateless__Ljapgolly_scalajs_react_component_builder_Builder$Step2 = (function() {
  return new $c_Ljapgolly_scalajs_react_component_builder_Builder$Step2().init___T__F1(this.name$1, $m_Ljapgolly_scalajs_react_component_builder_Builder$().japgolly$scalajs$react$component$builder$Builder$$InitStateUnit$1)
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step1.prototype.init___T = (function(name) {
  this.name$1 = name;
  return this
});
var $d_Ljapgolly_scalajs_react_component_builder_Builder$Step1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Builder$Step1: 0
}, false, "japgolly.scalajs.react.component.builder.Builder$Step1", {
  Ljapgolly_scalajs_react_component_builder_Builder$Step1: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step1.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Builder$Step1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Builder$Step2() {
  $c_O.call(this);
  this.name$1 = null;
  this.initStateFn$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step2.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step2.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Builder$Step2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Builder$Step2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Builder$Step2.prototype = $c_Ljapgolly_scalajs_react_component_builder_Builder$Step2.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step2.prototype.backend__F1__Ljapgolly_scalajs_react_component_builder_Builder$Step3 = (function(f) {
  return new $c_Ljapgolly_scalajs_react_component_builder_Builder$Step3().init___T__F1__F1(this.name$1, this.initStateFn$1, f)
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step2.prototype.noBackend__Ljapgolly_scalajs_react_component_builder_Builder$Step3 = (function() {
  return this.backend__F1__Ljapgolly_scalajs_react_component_builder_Builder$Step3(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$4$2) {
      $as_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(x$4$2)
    })
  })(this)))
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step2.prototype.init___T__F1 = (function(name, initStateFn) {
  this.name$1 = name;
  this.initStateFn$1 = initStateFn;
  return this
});
var $d_Ljapgolly_scalajs_react_component_builder_Builder$Step2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Builder$Step2: 0
}, false, "japgolly.scalajs.react.component.builder.Builder$Step2", {
  Ljapgolly_scalajs_react_component_builder_Builder$Step2: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step2.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Builder$Step2;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Builder$Step3() {
  $c_O.call(this);
  this.name$1 = null;
  this.initStateFn$1 = null;
  this.backendFn$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step3.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step3.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Builder$Step3;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Builder$Step3() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Builder$Step3.prototype = $c_Ljapgolly_scalajs_react_component_builder_Builder$Step3.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step3.prototype.renderWith__F1__Ljapgolly_scalajs_react_component_builder_Builder$Step4 = (function(r) {
  return new $c_Ljapgolly_scalajs_react_component_builder_Builder$Step4().init___T__F1__F1__F1__Ljapgolly_scalajs_react_component_builder_Lifecycle(this.name$1, this.initStateFn$1, this.backendFn$1, r, new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle().init___s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option($m_s_None$(), $m_s_None$(), $m_s_None$(), $m_s_None$(), $m_s_None$(), $m_s_None$(), $m_s_None$(), $m_s_None$(), $m_s_None$(), $m_s_None$()))
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step3.prototype.init___T__F1__F1 = (function(name, initStateFn, backendFn) {
  this.name$1 = name;
  this.initStateFn$1 = initStateFn;
  this.backendFn$1 = backendFn;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step3.prototype.renderStatic__Ljapgolly_scalajs_react_vdom_VdomNode__Ljapgolly_scalajs_react_component_builder_Builder$Step4 = (function(r) {
  return this.renderWith__F1__Ljapgolly_scalajs_react_component_builder_Builder$Step4(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, r$1) {
    return (function(x$5$2) {
      $as_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope(x$5$2);
      return r$1
    })
  })(this, r)))
});
var $d_Ljapgolly_scalajs_react_component_builder_Builder$Step3 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Builder$Step3: 0
}, false, "japgolly.scalajs.react.component.builder.Builder$Step3", {
  Ljapgolly_scalajs_react_component_builder_Builder$Step3: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step3.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Builder$Step3;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Builder$Step4() {
  $c_O.call(this);
  this.name$1 = null;
  this.initStateFn$1 = null;
  this.backendFn$1 = null;
  this.renderFn$1 = null;
  this.lifecycle$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step4.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step4.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Builder$Step4;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Builder$Step4() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Builder$Step4.prototype = $c_Ljapgolly_scalajs_react_component_builder_Builder$Step4.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step4.prototype.build__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_internal_JsRepr__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(ctorType, snapshotJs) {
  var c = $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$().apply__Ljapgolly_scalajs_react_component_builder_Builder$Step4__Ljapgolly_scalajs_react_internal_JsRepr__sjs_js_Function1(this, snapshotJs);
  return $m_Ljapgolly_scalajs_react_component_builder_Builder$().fromReactComponentClass__sjs_js_Function1__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot(c, ctorType)
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step4.prototype.init___T__F1__F1__F1__Ljapgolly_scalajs_react_component_builder_Lifecycle = (function(name, initStateFn, backendFn, renderFn, lifecycle) {
  this.name$1 = name;
  this.initStateFn$1 = initStateFn;
  this.backendFn$1 = backendFn;
  this.renderFn$1 = renderFn;
  this.lifecycle$1 = lifecycle;
  return this
});
var $d_Ljapgolly_scalajs_react_component_builder_Builder$Step4 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Builder$Step4: 0
}, false, "japgolly.scalajs.react.component.builder.Builder$Step4", {
  Ljapgolly_scalajs_react_component_builder_Builder$Step4: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Builder$Step4.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Builder$Step4;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_EntryPoint$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_builder_EntryPoint$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_EntryPoint$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_EntryPoint$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_EntryPoint$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_EntryPoint$.prototype = $c_Ljapgolly_scalajs_react_component_builder_EntryPoint$.prototype;
$c_Ljapgolly_scalajs_react_component_builder_EntryPoint$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_component_builder_EntryPoint$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_EntryPoint$: 0
}, false, "japgolly.scalajs.react.component.builder.EntryPoint$", {
  Ljapgolly_scalajs_react_component_builder_EntryPoint$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_EntryPoint$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_EntryPoint$;
var $n_Ljapgolly_scalajs_react_component_builder_EntryPoint$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_builder_EntryPoint$() {
  if ((!$n_Ljapgolly_scalajs_react_component_builder_EntryPoint$)) {
    $n_Ljapgolly_scalajs_react_component_builder_EntryPoint$ = new $c_Ljapgolly_scalajs_react_component_builder_EntryPoint$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_builder_EntryPoint$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$.prototype.toString$extension__Ljapgolly_scalajs_react_raw_React$Component__T = (function($$this) {
  var jsx$2 = $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$();
  var jsx$1 = $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$().props$extension__Ljapgolly_scalajs_react_raw_React$Component__O($$this);
  var this$1 = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_React$Component($$this);
  return jsx$2.japgolly$scalajs$react$component$builder$Lifecycle$$wrapTostring__T__T((((("ComponentDidMount(props: " + jsx$1) + ", state: ") + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).state__O()) + ")"))
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$.prototype.props$extension__Ljapgolly_scalajs_react_raw_React$Component__O = (function($$this) {
  var this$1 = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_React$Component($$this);
  return $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).props__O()
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$.prototype.equals$extension__Ljapgolly_scalajs_react_raw_React$Component__O__Z = (function($$this, x$1) {
  if ((x$1 instanceof $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount)) {
    var ComponentDidMount$1 = ((x$1 === null) ? null : $as_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount(x$1).raw$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z($$this, ComponentDidMount$1)
  } else {
    return false
  }
});
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentDidMount$", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$;
var $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$() {
  if ((!$n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$)) {
    $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$ = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$.prototype.toString$extension__Ljapgolly_scalajs_react_raw_React$Component__T = (function($$this) {
  var jsx$2 = $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$();
  var jsx$1 = $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$().props$extension__Ljapgolly_scalajs_react_raw_React$Component__O($$this);
  var this$1 = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount().init___Ljapgolly_scalajs_react_raw_React$Component($$this);
  return jsx$2.japgolly$scalajs$react$component$builder$Lifecycle$$wrapTostring__T__T((((("ComponentWillMount(props: " + jsx$1) + ", state: ") + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).state__O()) + ")"))
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$.prototype.props$extension__Ljapgolly_scalajs_react_raw_React$Component__O = (function($$this) {
  var this$1 = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount().init___Ljapgolly_scalajs_react_raw_React$Component($$this);
  return $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).props__O()
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$.prototype.equals$extension__Ljapgolly_scalajs_react_raw_React$Component__O__Z = (function($$this, x$1) {
  if ((x$1 instanceof $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount)) {
    var ComponentWillMount$1 = ((x$1 === null) ? null : $as_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount(x$1).raw$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z($$this, ComponentWillMount$1)
  } else {
    return false
  }
});
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentWillMount$", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$;
var $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$() {
  if ((!$n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$)) {
    $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$ = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$.prototype.toString$extension__Ljapgolly_scalajs_react_raw_React$Component__T = (function($$this) {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$().japgolly$scalajs$react$component$builder$Lifecycle$$wrapTostring__T__T((((("ComponentWillUnmount(props: " + $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$().props$extension__Ljapgolly_scalajs_react_raw_React$Component__O($$this)) + ", state: ") + $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$().state$extension__Ljapgolly_scalajs_react_raw_React$Component__O($$this)) + ")"))
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$.prototype.props$extension__Ljapgolly_scalajs_react_raw_React$Component__O = (function($$this) {
  var this$1 = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount().init___Ljapgolly_scalajs_react_raw_React$Component($$this);
  return $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).props__O()
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$.prototype.state$extension__Ljapgolly_scalajs_react_raw_React$Component__O = (function($$this) {
  var this$1 = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount().init___Ljapgolly_scalajs_react_raw_React$Component($$this);
  return $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).state__O()
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$.prototype.equals$extension__Ljapgolly_scalajs_react_raw_React$Component__O__Z = (function($$this, x$1) {
  if ((x$1 instanceof $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount)) {
    var ComponentWillUnmount$1 = ((x$1 === null) ? null : $as_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount(x$1).raw$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z($$this, ComponentWillUnmount$1)
  } else {
    return false
  }
});
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentWillUnmount$", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$;
var $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$() {
  if ((!$n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$)) {
    $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$ = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$.prototype.toString$extension__Ljapgolly_scalajs_react_raw_React$Component__T = (function($$this) {
  var jsx$2 = $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$();
  var jsx$1 = $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$().props$extension__Ljapgolly_scalajs_react_raw_React$Component__O($$this);
  var this$1 = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope().init___Ljapgolly_scalajs_react_raw_React$Component($$this);
  return jsx$2.japgolly$scalajs$react$component$builder$Lifecycle$$wrapTostring__T__T((((("Render(props: " + jsx$1) + ", state: ") + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).state__O()) + ")"))
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$.prototype.props$extension__Ljapgolly_scalajs_react_raw_React$Component__O = (function($$this) {
  var this$1 = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope().init___Ljapgolly_scalajs_react_raw_React$Component($$this);
  return $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).props__O()
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$.prototype.equals$extension__Ljapgolly_scalajs_react_raw_React$Component__O__Z = (function($$this, x$1) {
  if ((x$1 instanceof $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope)) {
    var RenderScope$1 = ((x$1 === null) ? null : $as_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope(x$1).raw$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z($$this, RenderScope$1)
  } else {
    return false
  }
});
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$RenderScope$", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$;
var $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$() {
  if ((!$n_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$)) {
    $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$ = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$() {
  $c_O.call(this);
  this.x$4$1 = null;
  this.$$undgetPrototypeOf$1 = null;
  this.$$undsetPrototypeOf$1 = null;
  this.ReactComponent$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype = $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype;
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ = this;
  var f = $g.Object.setPrototypeOf;
  var x1 = ((f === (void 0)) ? $m_s_None$() : new $c_s_Some().init___O(f));
  if ((x1 instanceof $c_s_Some)) {
    var x2 = $as_s_Some(x1);
    var set = x2.value$2;
    var _1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(o$2) {
        return $g.Object.getPrototypeOf(o$2)
      })
    })(this));
    var x1$2_$_$$und1$f = _1;
    var x1$2_$_$$und2$f = set
  } else {
    var x = $m_s_None$();
    if ((!(x === x1))) {
      throw new $c_s_MatchError().init___O(x1)
    };
    var get = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1) {
      return (function(x$1$2) {
        return x$1$2.__proto__
      })
    })(this));
    var set$2 = (function(arg1$2, arg2$2) {
      $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$().japgolly$scalajs$react$component$builder$ViaReactComponent$$$anonfun$x$4$3__sjs_js_Object__sjs_js_Object__V(arg1$2, arg2$2)
    });
    var x1$2_$_$$und1$f = get;
    var x1$2_$_$$und2$f = set$2
  };
  var _getPrototypeOf = $as_F1(x1$2_$_$$und1$f);
  var _setPrototypeOf = x1$2_$_$$und2$f;
  this.x$4$1 = new $c_T2().init___O__O(_getPrototypeOf, _setPrototypeOf);
  this.$$undgetPrototypeOf$1 = $as_F1(this.x$4$1.$$und1$f);
  this.$$undsetPrototypeOf$1 = this.x$4$1.$$und2$f;
  this.ReactComponent$1 = $g.React.Component;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.$$unddefineProperties__p1__sjs_js_Object__sjs_js_Array__V = (function(target, props) {
  var len = $uI(props.length);
  var i = 0;
  while ((i < len)) {
    var arg1 = props[i];
    arg1.configurable = true;
    if ($uZ(("value" in arg1))) {
      arg1.writable = true
    };
    $g.Object.defineProperty(target, $as_T(arg1.key), arg1);
    i = ((1 + i) | 0)
  }
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.japgolly$scalajs$react$component$builder$ViaReactComponent$$$anonfun$x$4$3__sjs_js_Object__sjs_js_Object__V = (function(x$2, x$3) {
  x$2.__proto__ = x$3
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.boxStateOrNull__p1__s_Option__Ljapgolly_scalajs_react_internal_Box = (function(o) {
  var x = $m_s_None$();
  if ((x === o)) {
    return null
  } else if ((o instanceof $c_s_Some)) {
    var x2 = $as_s_Some(o);
    var s2 = x2.value$2;
    $m_Ljapgolly_scalajs_react_internal_Box$();
    return {
      "a": s2
    }
  } else {
    throw new $c_s_MatchError().init___O(o)
  }
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.japgolly$scalajs$react$component$builder$ViaReactComponent$$Method__T__sjs_js_Any__Ljapgolly_scalajs_react_component_builder_ViaReactComponent$Method = (function(_key, _value) {
  return {
    "key": _key,
    "value": _value
  }
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.$$undpossibleConstructorReturn__p1__sjs_js_Any__sjs_js_Any__sjs_js_Any = (function(self, call) {
  return (($uZ((call instanceof $g.Object)) || $uZ((call instanceof $g.Function))) ? call : self)
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.$$undcreateClass__p1__sjs_js_Object__sjs_js_Array__sjs_js_Array__V = (function(c, protoProps, staticProps) {
  this.$$unddefineProperties__p1__sjs_js_Object__sjs_js_Array__V(c.prototype, protoProps);
  this.$$unddefineProperties__p1__sjs_js_Object__sjs_js_Array__V(c, staticProps)
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.japgolly$scalajs$react$component$builder$ViaReactComponent$$$anonfun$apply$1__Ljapgolly_scalajs_react_raw_React$Component__Ljapgolly_scalajs_react_internal_Box__sr_ObjectRef__F1__F1__Ljapgolly_scalajs_react_raw_React$Component = (function($this, props, MyComponent$1, backendFn$1, initStateFn$1) {
  var _this = $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$().$$undpossibleConstructorReturn__p1__sjs_js_Any__sjs_js_Any__sjs_js_Any($this, $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$().$$undgetPrototypeOf$1.apply__O__O(MyComponent$1.elem$1).call($this, props));
  $m_Ljapgolly_scalajs_react_component_Js$();
  var this$2 = new $c_Ljapgolly_scalajs_react_component_Js$$anon$3().init___Ljapgolly_scalajs_react_raw_React$Component(_this);
  _this.mountedImpure = ($m_Ljapgolly_scalajs_react_component_Scala$(), new $c_Ljapgolly_scalajs_react_component_Scala$$anon$1().init___Ljapgolly_scalajs_react_component_Js$MountedWithRoot(this$2));
  var this$4 = $as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(_this.mountedImpure);
  var t = $m_Ljapgolly_scalajs_react_internal_Effect$Trans$().idToCallback$1;
  _this.mountedPure = $as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$4.withEffect__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(t));
  _this.backend = backendFn$1.apply__O__O($as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(_this.mountedPure));
  _this.state = initStateFn$1.apply__O__O(props);
  return _this
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.$$undinherits__p1__sjs_js_Object__sjs_js_Object__V = (function(subClass, superClass) {
  subClass.prototype = $g.Object.create(superClass.prototype, {
    "constructor": {
      "value": subClass,
      "enumerable": false,
      "writable": true,
      "configurable": true
    }
  });
  (0, this.$$undsetPrototypeOf$1)(subClass, superClass)
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.apply__Ljapgolly_scalajs_react_component_builder_Builder$Step4__Ljapgolly_scalajs_react_internal_JsRepr__sjs_js_Function1 = (function(builder, snapshotJs) {
  var initStateFn = builder.initStateFn$1;
  var backendFn = builder.backendFn$1;
  var renderFn = builder.renderFn$1;
  var MyComponent = new $c_sr_ObjectRef().init___O(null);
  MyComponent.elem$1 = (function(MyComponent$1, backendFn$1, initStateFn$1) {
    return (function(arg1$2) {
      return $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$().japgolly$scalajs$react$component$builder$ViaReactComponent$$$anonfun$apply$1__Ljapgolly_scalajs_react_raw_React$Component__Ljapgolly_scalajs_react_internal_Box__sr_ObjectRef__F1__F1__Ljapgolly_scalajs_react_raw_React$Component(this, arg1$2, MyComponent$1, backendFn$1, initStateFn$1)
    })
  })(MyComponent, backendFn, initStateFn);
  this.$$undinherits__p1__sjs_js_Object__sjs_js_Object__V(MyComponent.elem$1, this.ReactComponent$1);
  var protoProps = $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().$$lessinit$greater$default$1__sjs_js_Array();
  var staticProps = $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$().$$lessinit$greater$default$1__sjs_js_Array();
  $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add0$extension__sjs_js_Array__T__F1__V(protoProps, "render", new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, renderFn$1) {
    return (function(_this$2) {
      return $as_Ljapgolly_scalajs_react_vdom_VdomNode(renderFn$1.apply__O__O(new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope().init___Ljapgolly_scalajs_react_raw_React$Component(_this$2))).rawNode__sjs_js_$bar()
    })
  })(this, renderFn)));
  var this$2 = builder.lifecycle$1.componentDidCatch$1;
  if ((!this$2.isEmpty__Z())) {
    var arg1 = this$2.get__O();
    var f = $as_F1(arg1);
    $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add2$extension__sjs_js_Array__T__F3__V(protoProps, "componentDidCatch", new $c_sjsr_AnonFunction3().init___sjs_js_Function3((function($this$1, f$1) {
      return (function(_this$2$1, e$2, i$2) {
        var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(f$1.apply__O__O(new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch().init___Ljapgolly_scalajs_react_raw_React$Component__Ljapgolly_scalajs_react_raw_React$Error__Ljapgolly_scalajs_react_raw_React$ErrorInfo(_this$2$1, e$2, i$2))).japgolly$scalajs$react$CallbackTo$$f$1;
        $$this.apply__O()
      })
    })(this, f)))
  };
  var this$4 = builder.lifecycle$1.componentDidMount$1;
  if ((!this$4.isEmpty__Z())) {
    var arg1$1 = this$4.get__O();
    var f$3 = $as_F1(arg1$1);
    $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add0$extension__sjs_js_Array__T__F1__V(protoProps, "componentDidMount", new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$2, f$2) {
      return (function(_this$2$2) {
        var $$this$1 = $as_Ljapgolly_scalajs_react_CallbackTo(f$2.apply__O__O(new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_React$Component(_this$2$2))).japgolly$scalajs$react$CallbackTo$$f$1;
        $$this$1.apply__O()
      })
    })(this, f$3)))
  };
  var this$6 = builder.lifecycle$1.componentDidUpdate$1;
  if ((!this$6.isEmpty__Z())) {
    var arg1$3 = this$6.get__O();
    var f$4 = $as_F1(arg1$3);
    $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add3$extension__sjs_js_Array__T__F4__V(protoProps, "componentDidUpdate", new $c_sjsr_AnonFunction4().init___sjs_js_Function4((function($this$3, f$5, snapshotJs$1) {
      return (function(_this$2$3, p$2, s$2, ss$2) {
        var $$this$2 = $as_Ljapgolly_scalajs_react_CallbackTo(f$5.apply__O__O(new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate().init___Ljapgolly_scalajs_react_raw_React$Component__O__O__O(_this$2$3, p$2.a, s$2.a, $f_Ljapgolly_scalajs_react_internal_JsRepr__unsafeFromJs__sjs_js_Any__O(snapshotJs$1, ss$2)))).japgolly$scalajs$react$CallbackTo$$f$1;
        $$this$2.apply__O()
      })
    })(this, f$4, snapshotJs)))
  };
  var this$8 = builder.lifecycle$1.componentWillMount$1;
  if ((!this$8.isEmpty__Z())) {
    var arg1$4 = this$8.get__O();
    var f$5$1 = $as_F1(arg1$4);
    $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add0$extension__sjs_js_Array__T__F1__V(protoProps, "componentWillMount", new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$4, f$6) {
      return (function(_this$2$4) {
        var $$this$3 = $as_Ljapgolly_scalajs_react_CallbackTo(f$6.apply__O__O(new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount().init___Ljapgolly_scalajs_react_raw_React$Component(_this$2$4))).japgolly$scalajs$react$CallbackTo$$f$1;
        $$this$3.apply__O()
      })
    })(this, f$5$1)))
  };
  var this$10 = builder.lifecycle$1.componentWillReceiveProps$1;
  if ((!this$10.isEmpty__Z())) {
    var arg1$5 = this$10.get__O();
    var f$6$1 = $as_F1(arg1$5);
    $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add1$extension__sjs_js_Array__T__F2__V(protoProps, "componentWillReceiveProps", new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this$5, f$7) {
      return (function(_this$2$5, p$2$1) {
        var $$this$4 = $as_Ljapgolly_scalajs_react_CallbackTo(f$7.apply__O__O(new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps().init___Ljapgolly_scalajs_react_raw_React$Component__O(_this$2$5, p$2$1.a))).japgolly$scalajs$react$CallbackTo$$f$1;
        $$this$4.apply__O()
      })
    })(this, f$6$1)))
  };
  var this$12 = builder.lifecycle$1.componentWillUnmount$1;
  if ((!this$12.isEmpty__Z())) {
    var arg1$6 = this$12.get__O();
    var f$7$1 = $as_F1(arg1$6);
    $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add0$extension__sjs_js_Array__T__F1__V(protoProps, "componentWillUnmount", new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$6, f$8) {
      return (function(_this$2$6) {
        var $$this$5 = $as_Ljapgolly_scalajs_react_CallbackTo(f$8.apply__O__O(new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount().init___Ljapgolly_scalajs_react_raw_React$Component(_this$2$6))).japgolly$scalajs$react$CallbackTo$$f$1;
        $$this$5.apply__O()
      })
    })(this, f$7$1)))
  };
  var this$14 = builder.lifecycle$1.componentWillUpdate$1;
  if ((!this$14.isEmpty__Z())) {
    var arg1$7 = this$14.get__O();
    var f$8$1 = $as_F1(arg1$7);
    $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add2$extension__sjs_js_Array__T__F3__V(protoProps, "componentWillUpdate", new $c_sjsr_AnonFunction3().init___sjs_js_Function3((function($this$7, f$9) {
      return (function(_this$2$7, p$2$2, s$2$1) {
        var $$this$6 = $as_Ljapgolly_scalajs_react_CallbackTo(f$9.apply__O__O(new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate().init___Ljapgolly_scalajs_react_raw_React$Component__O__O(_this$2$7, p$2$2.a, s$2$1.a))).japgolly$scalajs$react$CallbackTo$$f$1;
        $$this$6.apply__O()
      })
    })(this, f$8$1)))
  };
  var this$16 = builder.lifecycle$1.getDerivedStateFromProps$1;
  if ((!this$16.isEmpty__Z())) {
    var arg1$8 = this$16.get__O();
    var f$9$1 = $as_F2(arg1$8);
    $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$().add2$extension__sjs_js_Array__T__F2__V(staticProps, "getDerivedStateFromProps", new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this$8, f$10) {
      return (function(p$2$3, s$2$2) {
        return $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$().boxStateOrNull__p1__s_Option__Ljapgolly_scalajs_react_internal_Box($as_s_Option(f$10.apply__O__O__O(p$2$3.a, s$2$2.a)))
      })
    })(this, f$9$1)))
  };
  var this$17 = builder.lifecycle$1.getSnapshotBeforeUpdate$1;
  if ((!this$17.isEmpty__Z())) {
    var arg1$9 = this$17.get__O();
    var f$10$1 = $as_F1(arg1$9);
    $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add2$extension__sjs_js_Array__T__F3__V(protoProps, "getSnapshotBeforeUpdate", new $c_sjsr_AnonFunction3().init___sjs_js_Function3((function($this$9, snapshotJs$1$1, f$11) {
      return (function(_this$2$8, p$2$4, s$2$3) {
        var jsx$1 = snapshotJs$1$1.toJs$1;
        var $$this$7 = $as_Ljapgolly_scalajs_react_CallbackTo(f$11.apply__O__O(new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate().init___Ljapgolly_scalajs_react_raw_React$Component__O__O(_this$2$8, p$2$4.a, s$2$3.a))).japgolly$scalajs$react$CallbackTo$$f$1;
        return jsx$1.apply__O__O($$this$7.apply__O())
      })
    })(this, snapshotJs, f$10$1)))
  };
  var this$19 = builder.lifecycle$1.shouldComponentUpdate$1;
  if ((!this$19.isEmpty__Z())) {
    var arg1$10 = this$19.get__O();
    var f$11$1 = $as_F1(arg1$10);
    $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add2$extension__sjs_js_Array__T__F3__V(protoProps, "shouldComponentUpdate", new $c_sjsr_AnonFunction3().init___sjs_js_Function3((function($this$10, f$12) {
      return (function(_this$2$9, p$2$5, s$2$4) {
        var $$this$8 = $as_Ljapgolly_scalajs_react_CallbackTo(f$12.apply__O__O(new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate().init___Ljapgolly_scalajs_react_raw_React$Component__O__O(_this$2$9, p$2$5.a, s$2$4.a))).japgolly$scalajs$react$CallbackTo$$f$1;
        return $uZ($$this$8.apply__O())
      })
    })(this, f$11$1)))
  };
  var this$21 = $m_s_Option$().apply__O__s_Option(builder.name$1);
  if ((!this$21.isEmpty__Z())) {
    var arg1$11 = this$21.get__O();
    var n = $as_T(arg1$11);
    $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$().add$extension__sjs_js_Array__T__sjs_js_Any__V(staticProps, "displayName", n)
  };
  this.$$undcreateClass__p1__sjs_js_Object__sjs_js_Array__sjs_js_Array__V(MyComponent.elem$1, protoProps, staticProps);
  return MyComponent.elem$1
});
var $d_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_ViaReactComponent$: 0
}, false, "japgolly.scalajs.react.component.builder.ViaReactComponent$", {
  Ljapgolly_scalajs_react_component_builder_ViaReactComponent$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$;
var $n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$() {
  if ((!$n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$)) {
    $n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ = new $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype = $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype;
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype.add$extension__sjs_js_Array__T__sjs_js_Any__V = (function($$this, k, v) {
  $$this.push($m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$().japgolly$scalajs$react$component$builder$ViaReactComponent$$Method__T__sjs_js_Any__Ljapgolly_scalajs_react_component_builder_ViaReactComponent$Method(k, v))
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype.$$lessinit$greater$default$1__sjs_js_Array = (function() {
  return []
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype.add0$extension__sjs_js_Array__T__F1__V = (function($$this, k, f) {
  $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add$extension__sjs_js_Array__T__sjs_js_Any__V($$this, k, (function(f$1) {
    return (function() {
      return f$1.apply__O__O(this)
    })
  })(f))
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype.add3$extension__sjs_js_Array__T__F4__V = (function($$this, k, f) {
  $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add$extension__sjs_js_Array__T__sjs_js_Any__V($$this, k, (function(f$1) {
    return (function(arg1, arg2, arg3) {
      return f$1.apply__O__O__O__O__O(this, arg1, arg2, arg3)
    })
  })(f))
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype.add2$extension__sjs_js_Array__T__F3__V = (function($$this, k, f) {
  $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add$extension__sjs_js_Array__T__sjs_js_Any__V($$this, k, (function(f$1) {
    return (function(arg1, arg2) {
      return f$1.apply__O__O__O__O(this, arg1, arg2)
    })
  })(f))
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype.add1$extension__sjs_js_Array__T__F2__V = (function($$this, k, f) {
  $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().add$extension__sjs_js_Array__T__sjs_js_Any__V($$this, k, (function(f$1) {
    return (function(arg1) {
      return f$1.apply__O__O__O(this, arg1)
    })
  })(f))
});
var $d_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$: 0
}, false, "japgolly.scalajs.react.component.builder.ViaReactComponent$ProtoProps$", {
  Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$;
var $n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$() {
  if ((!$n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$)) {
    $n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$ = new $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$ProtoProps$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$.prototype = $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$.prototype;
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$.prototype.add$extension__sjs_js_Array__T__sjs_js_Any__V = (function($$this, k, v) {
  $$this.push($m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$().japgolly$scalajs$react$component$builder$ViaReactComponent$$Method__T__sjs_js_Any__Ljapgolly_scalajs_react_component_builder_ViaReactComponent$Method(k, v))
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$.prototype.$$lessinit$greater$default$1__sjs_js_Array = (function() {
  return []
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$.prototype.add2$extension__sjs_js_Array__T__F2__V = (function($$this, k, f) {
  $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$().add$extension__sjs_js_Array__T__sjs_js_Any__V($$this, k, (function(f$1) {
    return (function(arg1, arg2) {
      return f$1.apply__O__O__O(arg1, arg2)
    })
  })(f))
});
var $d_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$: 0
}, false, "japgolly.scalajs.react.component.builder.ViaReactComponent$StaticProps$", {
  Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$;
var $n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$() {
  if ((!$n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$)) {
    $n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$ = new $c_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_builder_ViaReactComponent$StaticProps$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_feature_ReactFragment$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_feature_ReactFragment$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_feature_ReactFragment$.prototype.constructor = $c_Ljapgolly_scalajs_react_feature_ReactFragment$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_feature_ReactFragment$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_feature_ReactFragment$.prototype = $c_Ljapgolly_scalajs_react_feature_ReactFragment$.prototype;
$c_Ljapgolly_scalajs_react_feature_ReactFragment$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_feature_ReactFragment$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_feature_ReactFragment$: 0
}, false, "japgolly.scalajs.react.feature.ReactFragment$", {
  Ljapgolly_scalajs_react_feature_ReactFragment$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_feature_ReactFragment$.prototype.$classData = $d_Ljapgolly_scalajs_react_feature_ReactFragment$;
var $n_Ljapgolly_scalajs_react_feature_ReactFragment$ = (void 0);
function $m_Ljapgolly_scalajs_react_feature_ReactFragment$() {
  if ((!$n_Ljapgolly_scalajs_react_feature_ReactFragment$)) {
    $n_Ljapgolly_scalajs_react_feature_ReactFragment$ = new $c_Ljapgolly_scalajs_react_feature_ReactFragment$().init___()
  };
  return $n_Ljapgolly_scalajs_react_feature_ReactFragment$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Box$() {
  $c_O.call(this);
  this.Unit$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Box$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Box$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Box$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Box$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Box$.prototype = $c_Ljapgolly_scalajs_react_internal_Box$.prototype;
$c_Ljapgolly_scalajs_react_internal_Box$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_Box$ = this;
  this.Unit$1 = ($m_Ljapgolly_scalajs_react_internal_Box$(), {
    "a": (void 0)
  });
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Box$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Box$: 0
}, false, "japgolly.scalajs.react.internal.Box$", {
  Ljapgolly_scalajs_react_internal_Box$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Box$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Box$;
var $n_Ljapgolly_scalajs_react_internal_Box$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_Box$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_Box$)) {
    $n_Ljapgolly_scalajs_react_internal_Box$ = new $c_Ljapgolly_scalajs_react_internal_Box$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_Box$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_internal_Effect.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Effect.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect.prototype = $c_Ljapgolly_scalajs_react_internal_Effect.prototype;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$() {
  $c_O.call(this);
  this.idInstance$1 = null;
  this.callbackInstance$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Effect$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Effect$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_Effect$ = this;
  this.idInstance$1 = new $c_Ljapgolly_scalajs_react_internal_Effect$$anon$1().init___();
  this.callbackInstance$1 = new $c_Ljapgolly_scalajs_react_internal_Effect$$anon$2().init___();
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Effect$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$: 0
}, false, "japgolly.scalajs.react.internal.Effect$", {
  Ljapgolly_scalajs_react_internal_Effect$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$;
var $n_Ljapgolly_scalajs_react_internal_Effect$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_Effect$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_Effect$)) {
    $n_Ljapgolly_scalajs_react_internal_Effect$ = new $c_Ljapgolly_scalajs_react_internal_Effect$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_Effect$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$Trans() {
  $c_O.call(this);
  this.from$1 = null;
  this.to$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$Trans;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$Trans() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.apply__F0__O = (function(f) {
  var fn = this.from$1.extract__F0__F0(f);
  return this.to$1.point__F0__O(fn)
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.compose__Ljapgolly_scalajs_react_internal_Effect$Trans__s_$less$colon$less__Ljapgolly_scalajs_react_internal_Effect$Trans = (function(t, ev) {
  if ((ev === null)) {
    return new $c_Ljapgolly_scalajs_react_internal_Effect$Trans().init___Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect(this.from$1, t.to$1)
  } else {
    $m_Ljapgolly_scalajs_react_internal_Effect$Trans$();
    var F = this.from$1;
    var x = new $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id().init___Ljapgolly_scalajs_react_internal_Effect(F);
    return x
  }
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.init___Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect = (function(from, to) {
  this.from$1 = from;
  this.to$1 = to;
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Effect$Trans = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$Trans: 0
}, false, "japgolly.scalajs.react.internal.Effect$Trans", {
  Ljapgolly_scalajs_react_internal_Effect$Trans: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$Trans;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$Trans$() {
  $c_O.call(this);
  this.endoId$1 = null;
  this.endoCallback$1 = null;
  this.idToCallback$1 = null;
  this.callbackToId$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$Trans$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$Trans$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_Effect$Trans$ = this;
  $m_Ljapgolly_scalajs_react_internal_Effect$Trans$();
  var F = $m_Ljapgolly_scalajs_react_internal_Effect$().idInstance$1;
  this.endoId$1 = new $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id().init___Ljapgolly_scalajs_react_internal_Effect(F);
  $m_Ljapgolly_scalajs_react_internal_Effect$Trans$();
  var F$1 = $m_Ljapgolly_scalajs_react_internal_Effect$().callbackInstance$1;
  this.endoCallback$1 = new $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id().init___Ljapgolly_scalajs_react_internal_Effect(F$1);
  this.idToCallback$1 = $m_Ljapgolly_scalajs_react_internal_Effect$Trans$().apply__Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect__s_$eq$colon$eq__Ljapgolly_scalajs_react_internal_Effect$Trans($m_Ljapgolly_scalajs_react_internal_Effect$().idInstance$1, $m_Ljapgolly_scalajs_react_internal_Effect$().callbackInstance$1, ($m_Ljapgolly_scalajs_react_internal_Effect$Trans$(), null));
  this.callbackToId$1 = $m_Ljapgolly_scalajs_react_internal_Effect$Trans$().apply__Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect__s_$eq$colon$eq__Ljapgolly_scalajs_react_internal_Effect$Trans($m_Ljapgolly_scalajs_react_internal_Effect$().callbackInstance$1, $m_Ljapgolly_scalajs_react_internal_Effect$().idInstance$1, ($m_Ljapgolly_scalajs_react_internal_Effect$Trans$(), null));
  return this
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype.apply__Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect__s_$eq$colon$eq__Ljapgolly_scalajs_react_internal_Effect$Trans = (function(F, G, ev) {
  if ((ev === null)) {
    return new $c_Ljapgolly_scalajs_react_internal_Effect$Trans().init___Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect(F, G)
  } else {
    var x = new $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id().init___Ljapgolly_scalajs_react_internal_Effect(F);
    return x
  }
});
var $d_Ljapgolly_scalajs_react_internal_Effect$Trans$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$Trans$: 0
}, false, "japgolly.scalajs.react.internal.Effect$Trans$", {
  Ljapgolly_scalajs_react_internal_Effect$Trans$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$Trans$;
var $n_Ljapgolly_scalajs_react_internal_Effect$Trans$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_Effect$Trans$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_Effect$Trans$)) {
    $n_Ljapgolly_scalajs_react_internal_Effect$Trans$ = new $c_Ljapgolly_scalajs_react_internal_Effect$Trans$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_Effect$Trans$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_JsUtil$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_JsUtil$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_JsUtil$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_JsUtil$.prototype = $c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype;
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype.objectIterator__sjs_js_Object__sc_Iterator = (function(o) {
  var array = $propertiesOf(o);
  var this$5 = new $c_sjs_js_ArrayOps$ArrayIterator().init___sjs_js_Array(array);
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, d) {
    return (function(n$2) {
      var n = $as_T(n$2);
      try {
        var v = d[n]
      } catch (e) {
        var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
        if ((e$2 !== null)) {
          var v = $m_Ljapgolly_scalajs_react_internal_JsUtil$().safeToString__O__T(e$2)
        } else {
          var v;
          throw e
        }
      };
      return new $c_T2().init___O__O(n, v)
    })
  })(this, o));
  return new $c_sc_Iterator$$anon$9().init___sc_Iterator__F1(this$5, f)
});
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype.symbolToString__sjs_js_Symbol__T = (function(s) {
  try {
    return $as_T(s.toString())
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      var value = $g.Symbol.keyFor(s);
      var x1 = ((value === (void 0)) ? $m_s_None$() : new $c_s_Some().init___O(value));
      if ((x1 instanceof $c_s_Some)) {
        var x2 = $as_s_Some(x1);
        var k = $as_T(x2.value$2);
        return (("Symbol(" + k) + ")")
      } else {
        var x = $m_s_None$();
        if ((x === x1)) {
          return "Symbol(?)"
        } else {
          throw new $c_s_MatchError().init___O(x1)
        }
      }
    } else {
      throw e
    }
  }
});
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype.safeToString__O__T = (function(a) {
  try {
    if ((a !== null)) {
      var o7 = $m_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$().unapply__O__s_Option(a);
      if ((!o7.isEmpty__Z())) {
        var s = o7.get__O();
        return this.symbolToString__sjs_js_Symbol__T(s)
      }
    };
    return $objectToString(a)
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return "?"
    } else {
      throw e
    }
  }
});
var $d_Ljapgolly_scalajs_react_internal_JsUtil$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_JsUtil$: 0
}, false, "japgolly.scalajs.react.internal.JsUtil$", {
  Ljapgolly_scalajs_react_internal_JsUtil$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_JsUtil$;
var $n_Ljapgolly_scalajs_react_internal_JsUtil$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_JsUtil$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_JsUtil$)) {
    $n_Ljapgolly_scalajs_react_internal_JsUtil$ = new $c_Ljapgolly_scalajs_react_internal_JsUtil$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_JsUtil$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$.prototype = $c_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$.prototype;
$c_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$.prototype.unapply__O__s_Option = (function(a) {
  var x1 = $as_T((typeof a));
  return ((x1 === "symbol") ? new $c_s_Some().init___O(a) : $m_s_None$())
});
var $d_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$: 0
}, false, "japgolly.scalajs.react.internal.JsUtil$JsSymbol$", {
  Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$;
var $n_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$)) {
    $n_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$ = new $c_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_JsUtil$JsSymbol$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Lens() {
  $c_O.call(this);
  this.get$1 = null;
  this.set$1 = null;
  this.mod$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Lens.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Lens.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Lens;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Lens() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Lens.prototype = $c_Ljapgolly_scalajs_react_internal_Lens.prototype;
$c_Ljapgolly_scalajs_react_internal_Lens.prototype.init___F1__F1 = (function(get, set) {
  this.get$1 = get;
  this.set$1 = set;
  this.mod$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(f$2) {
      var f = $as_F1(f$2);
      return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, f$1) {
        return (function(a$2) {
          return $as_F1($this$1.set$1.apply__O__O(f$1.apply__O__O($this$1.get$1.apply__O__O(a$2)))).apply__O__O(a$2)
        })
      })($this, f))
    })
  })(this));
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Lens = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Lens: 0
}, false, "japgolly.scalajs.react.internal.Lens", {
  Ljapgolly_scalajs_react_internal_Lens: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Lens.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Lens;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Lens$() {
  $c_O.call(this);
  this.idInstance$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Lens$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Lens$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Lens$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Lens$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Lens$.prototype = $c_Ljapgolly_scalajs_react_internal_Lens$.prototype;
$c_Ljapgolly_scalajs_react_internal_Lens$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_Lens$ = this;
  this.idInstance$1 = this.$$undid__p1__Ljapgolly_scalajs_react_internal_Lens();
  return this
});
$c_Ljapgolly_scalajs_react_internal_Lens$.prototype.$$undid__p1__Ljapgolly_scalajs_react_internal_Lens = (function() {
  var get = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(a$2) {
      return a$2
    })
  })(this));
  var set = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(a$3$2) {
      return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, a) {
        return (function(x$5$2) {
          return a
        })
      })(this$2, a$3$2))
    })
  })(this));
  return new $c_Ljapgolly_scalajs_react_internal_Lens().init___F1__F1(get, set)
});
var $d_Ljapgolly_scalajs_react_internal_Lens$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Lens$: 0
}, false, "japgolly.scalajs.react.internal.Lens$", {
  Ljapgolly_scalajs_react_internal_Lens$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Lens$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Lens$;
var $n_Ljapgolly_scalajs_react_internal_Lens$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_Lens$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_Lens$)) {
    $n_Ljapgolly_scalajs_react_internal_Lens$ = new $c_Ljapgolly_scalajs_react_internal_Lens$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_Lens$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Profunctor$Ops() {
  $c_O.call(this);
  this.f$1 = null;
  this.p$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Profunctor$Ops;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Profunctor$Ops() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype = $c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype;
$c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype.init___O__Ljapgolly_scalajs_react_internal_Profunctor = (function(f, p) {
  this.f$1 = f;
  this.p$1 = p;
  return this
});
$c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype.dimap__F1__F1__O = (function(l, r) {
  var this$1 = this.p$1;
  var f = this.f$1;
  return this$1.dimap__Ljapgolly_scalajs_react_CtorType$Nullary__F1__F1__Ljapgolly_scalajs_react_CtorType$Nullary($as_Ljapgolly_scalajs_react_CtorType$Nullary(f), l, r)
});
var $d_Ljapgolly_scalajs_react_internal_Profunctor$Ops = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Profunctor$Ops: 0
}, false, "japgolly.scalajs.react.internal.Profunctor$Ops", {
  Ljapgolly_scalajs_react_internal_Profunctor$Ops: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Profunctor$Ops;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Singleton() {
  $c_O.call(this);
  this.value$1 = null;
  this.mutableObj$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Singleton.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Singleton.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Singleton;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Singleton() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Singleton.prototype = $c_Ljapgolly_scalajs_react_internal_Singleton.prototype;
$c_Ljapgolly_scalajs_react_internal_Singleton.prototype.init___O__F0__F0 = (function(value, mutable, mutableObj) {
  this.value$1 = value;
  this.mutableObj$1 = mutableObj;
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Singleton = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Singleton: 0
}, false, "japgolly.scalajs.react.internal.Singleton", {
  Ljapgolly_scalajs_react_internal_Singleton: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Singleton.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Singleton;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Singleton$() {
  $c_O.call(this);
  this.Null$1 = null;
  this.Unit$1 = null;
  this.BoxUnit$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Singleton$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Singleton$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Singleton$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Singleton$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Singleton$.prototype = $c_Ljapgolly_scalajs_react_internal_Singleton$.prototype;
$c_Ljapgolly_scalajs_react_internal_Singleton$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_Singleton$ = this;
  this.Null$1 = new $c_Ljapgolly_scalajs_react_internal_Singleton().init___O__F0__F0(null, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return null
    })
  })(this)), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2) {
    return (function() {
      return {}
    })
  })(this)));
  this.Unit$1 = new $c_Ljapgolly_scalajs_react_internal_Singleton().init___O__F0__F0((void 0), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$3) {
    return (function() {
      return (void 0)
    })
  })(this)), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$4) {
    return (function() {
      return {}
    })
  })(this)));
  this.BoxUnit$1 = new $c_Ljapgolly_scalajs_react_internal_Singleton().init___O__F0__F0($m_Ljapgolly_scalajs_react_internal_Box$().Unit$1, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$5) {
    return (function() {
      $m_Ljapgolly_scalajs_react_internal_Box$();
      return {
        "a": (void 0)
      }
    })
  })(this)), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$6) {
    return (function() {
      $m_Ljapgolly_scalajs_react_internal_Box$();
      return {
        "a": (void 0)
      }
    })
  })(this)));
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Singleton$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Singleton$: 0
}, false, "japgolly.scalajs.react.internal.Singleton$", {
  Ljapgolly_scalajs_react_internal_Singleton$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Singleton$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Singleton$;
var $n_Ljapgolly_scalajs_react_internal_Singleton$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_Singleton$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_Singleton$)) {
    $n_Ljapgolly_scalajs_react_internal_Singleton$ = new $c_Ljapgolly_scalajs_react_internal_Singleton$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_Singleton$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_package$() {
  $c_O.call(this);
  this.identityFnInstance$1 = null
}
$c_Ljapgolly_scalajs_react_internal_package$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_package$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_package$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_package$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_package$.prototype = $c_Ljapgolly_scalajs_react_internal_package$.prototype;
$c_Ljapgolly_scalajs_react_internal_package$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_package$ = this;
  this.identityFnInstance$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(a$2) {
      return a$2
    })
  })(this));
  return this
});
var $d_Ljapgolly_scalajs_react_internal_package$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_package$: 0
}, false, "japgolly.scalajs.react.internal.package$", {
  Ljapgolly_scalajs_react_internal_package$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_package$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_package$;
var $n_Ljapgolly_scalajs_react_internal_package$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_package$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_package$)) {
    $n_Ljapgolly_scalajs_react_internal_package$ = new $c_Ljapgolly_scalajs_react_internal_package$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_package$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr() {
  $c_O.call(this);
  this.attrName$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.equals__O__Z = (function(any) {
  if ((any instanceof $c_Ljapgolly_scalajs_react_vdom_Attr)) {
    var x2 = $as_Ljapgolly_scalajs_react_vdom_Attr(any);
    return (this.attrName$1 === x2.attrName$1)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.toString__T = (function() {
  return (("VdomAttr{name=" + this.attrName$1) + "}")
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.init___T = (function(attrName) {
  this.attrName$1 = attrName;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.hashCode__I = (function() {
  return $m_sr_Statics$().anyHash__O__I(this.attrName$1)
});
function $as_Ljapgolly_scalajs_react_vdom_Attr(obj) {
  return (((obj instanceof $c_Ljapgolly_scalajs_react_vdom_Attr) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.Attr"))
}
function $isArrayOf_Ljapgolly_scalajs_react_vdom_Attr(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_Attr)))
}
function $asArrayOf_Ljapgolly_scalajs_react_vdom_Attr(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_Attr(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.Attr;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Attr$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Attr$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr$.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Attr$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr$: 0
}, false, "japgolly.scalajs.react.vdom.Attr$", {
  Ljapgolly_scalajs_react_vdom_Attr$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr$;
var $n_Ljapgolly_scalajs_react_vdom_Attr$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Attr$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Attr$)) {
    $n_Ljapgolly_scalajs_react_vdom_Attr$ = new $c_Ljapgolly_scalajs_react_vdom_Attr$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Attr$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$() {
  $c_O.call(this);
  this.direct$1 = null;
  this.string$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr$ValueType$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_Attr$ValueType$ = this;
  var fn = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this) {
    return (function(x$6$2, x$7$2) {
      var x$6 = $as_F1(x$6$2);
      x$6.apply__O__O(x$7$2)
    })
  })(this));
  this.direct$1 = fn;
  var fn$1 = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(this$2) {
    return (function(x$8$2, x$9$2) {
      var x$8 = $as_F1(x$8$2);
      var x$9 = $as_T(x$9$2);
      x$8.apply__O__O(x$9)
    })
  })(this));
  this.string$1 = fn$1;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype.byImplicit__F1__F2 = (function(f) {
  var fn = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this, f$1) {
    return (function(b$2, a$2) {
      var b = $as_F1(b$2);
      b.apply__O__O(f$1.apply__O__O(a$2))
    })
  })(this, f));
  return fn
});
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype.apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod = (function($$this, name, value) {
  $m_Ljapgolly_scalajs_react_vdom_TagMod$();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, $$this$1, name$1, value$1) {
    return (function(b$2) {
      var b = $as_Ljapgolly_scalajs_react_vdom_Builder(b$2);
      $$this$1.apply__O__O__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, b$1, name$1$1) {
        return (function(x$5$2) {
          b$1.addAttr$1.apply__O__O__O(name$1$1, x$5$2)
        })
      })($this, b, name$1)), value$1)
    })
  })(this, $$this, name, value));
  return new $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3().init___F1(f)
});
var $d_Ljapgolly_scalajs_react_vdom_Attr$ValueType$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr$ValueType$: 0
}, false, "japgolly.scalajs.react.vdom.Attr$ValueType$", {
  Ljapgolly_scalajs_react_vdom_Attr$ValueType$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr$ValueType$;
var $n_Ljapgolly_scalajs_react_vdom_Attr$ValueType$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Attr$ValueType$)) {
    $n_Ljapgolly_scalajs_react_vdom_Attr$ValueType$ = new $c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Attr$ValueType$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Builder$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Builder$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Builder$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Builder$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Builder$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Builder$.prototype = $c_Ljapgolly_scalajs_react_vdom_Builder$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Builder$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Builder$.prototype.nonEmptyObject__sjs_js_Object__sjs_js_UndefOr = (function(o) {
  return (($uI($g.Object.keys(o).length) === 0) ? (void 0) : o)
});
$c_Ljapgolly_scalajs_react_vdom_Builder$.prototype.setObjectKeyValue__sjs_js_Object__T__sjs_js_Any__V = (function(o, k, v) {
  o[k] = v
});
var $d_Ljapgolly_scalajs_react_vdom_Builder$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Builder$: 0
}, false, "japgolly.scalajs.react.vdom.Builder$", {
  Ljapgolly_scalajs_react_vdom_Builder$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Builder$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Builder$;
var $n_Ljapgolly_scalajs_react_vdom_Builder$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Builder$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Builder$)) {
    $n_Ljapgolly_scalajs_react_vdom_Builder$ = new $c_Ljapgolly_scalajs_react_vdom_Builder$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Builder$
}
function $f_Ljapgolly_scalajs_react_vdom_Builder$ToJs__$$init$__V($thiz) {
  $thiz.props$1 = {};
  $thiz.styles$1 = {};
  $thiz.children$1 = [];
  $thiz.key$1 = (void 0);
  $thiz.nonEmptyClassName$1 = (void 0);
  $thiz.addAttr$1 = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this) {
    return (function(x$1$2, x$2$2) {
      var x$1 = $as_T(x$1$2);
      $m_Ljapgolly_scalajs_react_vdom_Builder$().setObjectKeyValue__sjs_js_Object__T__sjs_js_Any__V($this.props$1, x$1, x$2$2)
    })
  })($thiz));
  $thiz.addClassName$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(n$2) {
      var value = this$2.nonEmptyClassName$1;
      if ((value === (void 0))) {
        var value$1 = n$2
      } else {
        var s = (($objectToString(value) + " ") + n$2);
        var value$1 = s
      };
      this$2.nonEmptyClassName$1 = value$1
    })
  })($thiz));
  $thiz.addStyle$1 = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(this$3$1) {
    return (function(x$4$2, x$5$2) {
      var x$4 = $as_T(x$4$2);
      $m_Ljapgolly_scalajs_react_vdom_Builder$().setObjectKeyValue__sjs_js_Object__T__sjs_js_Any__V(this$3$1.styles$1, x$4, x$5$2)
    })
  })($thiz));
  $thiz.addStylesObject$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$4$1) {
    return (function(o$2) {
      var this$9 = $m_Ljapgolly_scalajs_react_internal_JsUtil$().objectIterator__sjs_js_Object__sc_Iterator(o$2);
      while (this$9.hasNext__Z()) {
        var arg1 = this$9.next__O();
        var x$6 = $as_T2(arg1);
        if ((x$6 !== null)) {
          var k = $as_T(x$6.$$und1$f);
          var v = x$6.$$und2$f;
          $asUnit(this$4$1.addStyle$1.apply__O__O__O(k, v))
        } else {
          throw new $c_s_MatchError().init___O(x$6)
        }
      }
    })
  })($thiz));
  $thiz.appendChild$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$5$1) {
    return (function(x$7$2) {
      this$5$1.children$1.push(x$7$2)
    })
  })($thiz));
  $thiz.setKey$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$6$1) {
    return (function(k$2) {
      this$6$1.key$1 = k$2
    })
  })($thiz))
}
function $f_Ljapgolly_scalajs_react_vdom_Builder$ToJs__addClassNameToProps__V($thiz) {
  var value = $thiz.nonEmptyClassName$1;
  if ((value !== (void 0))) {
    $m_Ljapgolly_scalajs_react_vdom_Builder$().setObjectKeyValue__sjs_js_Object__T__sjs_js_Any__V($thiz.props$1, "className", value)
  }
}
function $f_Ljapgolly_scalajs_react_vdom_Builder$ToJs__addStyleToProps__V($thiz) {
  var value = $m_Ljapgolly_scalajs_react_vdom_Builder$().nonEmptyObject__sjs_js_Object__sjs_js_UndefOr($thiz.styles$1);
  if ((value !== (void 0))) {
    $m_Ljapgolly_scalajs_react_vdom_Builder$().setObjectKeyValue__sjs_js_Object__T__sjs_js_Any__V($thiz.props$1, "style", value)
  }
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$() {
  $c_O.call(this);
  this.build$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$.prototype = $c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$ = this;
  this.build$1 = new $c_sjsr_AnonFunction4().init___sjs_js_Function4((function($this) {
    return (function(tag$2, props$2, key$2, children$2) {
      var tag = $as_T(tag$2);
      if ((key$2 !== (void 0))) {
        $m_Ljapgolly_scalajs_react_vdom_Builder$().setObjectKeyValue__sjs_js_Object__T__sjs_js_Any__V(props$2, "key", key$2)
      };
      var jsx$1 = $g.React;
      var jsx$4 = jsx$1.createElement;
      var col = $m_sci_IndexedSeq$().from__sc_IterableOnce__sci_IndexedSeq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(children$2));
      if ((col instanceof $c_sjs_js_WrappedArray)) {
        var x2 = $as_sjs_js_WrappedArray(col);
        var jsx$3 = x2.array$5
      } else {
        var result = [];
        var this$12 = col.iterator__sc_Iterator();
        while (this$12.hasNext__Z()) {
          var arg1 = this$12.next__O();
          $uI(result.push(arg1))
        };
        var jsx$3 = result
      };
      var jsx$2 = [tag, props$2].concat(jsx$3);
      return jsx$4.apply(jsx$1, jsx$2)
    })
  })(this));
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$: 0
}, false, "japgolly.scalajs.react.vdom.Builder$ToRawReactElement$", {
  Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$;
var $n_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$)) {
    $n_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$ = new $c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Exports() {
  $c_O.call(this);
  this.EmptyVdom$1 = null;
  this.HtmlTagOf$1 = null;
  this.ReactPortal$1 = null;
  this.SvgTagOf$1 = null;
  this.TagMod$1 = null;
  this.VdomAttr$1 = null;
  this.VdomArray$1 = null;
  this.VdomElement$1 = null;
  this.VdomNode$1 = null;
  this.VdomStyle$1 = null;
  this.ReactFragment$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Exports.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Exports.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Exports;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Exports() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Exports.prototype = $c_Ljapgolly_scalajs_react_vdom_Exports.prototype;
$c_Ljapgolly_scalajs_react_vdom_Exports.prototype.init___ = (function() {
  this.EmptyVdom$1 = $m_Ljapgolly_scalajs_react_vdom_VdomNode$().empty$1;
  this.HtmlTagOf$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  this.ReactFragment$1 = $m_Ljapgolly_scalajs_react_feature_ReactFragment$();
  this.ReactPortal$1 = $m_Ljapgolly_scalajs_react_vdom_ReactPortal$();
  this.SvgTagOf$1 = $m_Ljapgolly_scalajs_react_vdom_SvgTagOf$();
  this.TagMod$1 = $m_Ljapgolly_scalajs_react_vdom_TagMod$();
  this.VdomAttr$1 = $m_Ljapgolly_scalajs_react_vdom_Attr$();
  this.VdomArray$1 = $m_Ljapgolly_scalajs_react_vdom_VdomArray$();
  this.VdomElement$1 = $m_Ljapgolly_scalajs_react_vdom_VdomElement$();
  this.VdomNode$1 = $m_Ljapgolly_scalajs_react_vdom_VdomNode$();
  this.VdomStyle$1 = $m_Ljapgolly_scalajs_react_vdom_Style$();
  return this
});
function $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr__$$init$__V($thiz) {
  $thiz.vdomAttrVtBoolean$2 = $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().byImplicit__F1__F2(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(value$2) {
      var value = $uZ(value$2);
      return value
    })
  })($thiz)));
  $thiz.vdomAttrVtString$2 = $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().string$1;
  $thiz.vdomAttrVtInt$2 = $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().byImplicit__F1__F2(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(value$3$2) {
      var value$3 = $uI(value$3$2);
      return value$3
    })
  })($thiz)));
  $thiz.vdomAttrVtJsObject$2 = $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().direct$1
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_ReactPortal$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_ReactPortal$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_ReactPortal$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_ReactPortal$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_ReactPortal$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_ReactPortal$.prototype = $c_Ljapgolly_scalajs_react_vdom_ReactPortal$.prototype;
$c_Ljapgolly_scalajs_react_vdom_ReactPortal$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_ReactPortal$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_ReactPortal$: 0
}, false, "japgolly.scalajs.react.vdom.ReactPortal$", {
  Ljapgolly_scalajs_react_vdom_ReactPortal$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_ReactPortal$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_ReactPortal$;
var $n_Ljapgolly_scalajs_react_vdom_ReactPortal$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_ReactPortal$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_ReactPortal$)) {
    $n_Ljapgolly_scalajs_react_vdom_ReactPortal$ = new $c_Ljapgolly_scalajs_react_vdom_ReactPortal$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_ReactPortal$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Style$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Style$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Style$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Style$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Style$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Style$.prototype = $c_Ljapgolly_scalajs_react_vdom_Style$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Style$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Style$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Style$: 0
}, false, "japgolly.scalajs.react.vdom.Style$", {
  Ljapgolly_scalajs_react_vdom_Style$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Style$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Style$;
var $n_Ljapgolly_scalajs_react_vdom_Style$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Style$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Style$)) {
    $n_Ljapgolly_scalajs_react_vdom_Style$ = new $c_Ljapgolly_scalajs_react_vdom_Style$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Style$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_TagMod$() {
  $c_O.call(this);
  this.empty$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_TagMod$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_TagMod$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_TagMod$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_TagMod$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_TagMod$.prototype = $c_Ljapgolly_scalajs_react_vdom_TagMod$.prototype;
$c_Ljapgolly_scalajs_react_vdom_TagMod$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_TagMod$ = this;
  this.empty$1 = new $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2().init___();
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_TagMod$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_TagMod$: 0
}, false, "japgolly.scalajs.react.vdom.TagMod$", {
  Ljapgolly_scalajs_react_vdom_TagMod$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_TagMod$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_TagMod$;
var $n_Ljapgolly_scalajs_react_vdom_TagMod$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_TagMod$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_TagMod$)) {
    $n_Ljapgolly_scalajs_react_vdom_TagMod$ = new $c_Ljapgolly_scalajs_react_vdom_TagMod$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_TagMod$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_VdomArray$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_VdomArray$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_VdomArray$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype = $c_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype;
$c_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_VdomArray$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_VdomArray$: 0
}, false, "japgolly.scalajs.react.vdom.VdomArray$", {
  Ljapgolly_scalajs_react_vdom_VdomArray$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_VdomArray$;
var $n_Ljapgolly_scalajs_react_vdom_VdomArray$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_VdomArray$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_VdomArray$)) {
    $n_Ljapgolly_scalajs_react_vdom_VdomArray$ = new $c_Ljapgolly_scalajs_react_vdom_VdomArray$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_VdomArray$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_VdomElement$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_VdomElement$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_VdomElement$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype = $c_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype;
$c_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_VdomElement$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_VdomElement$: 0
}, false, "japgolly.scalajs.react.vdom.VdomElement$", {
  Ljapgolly_scalajs_react_vdom_VdomElement$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_VdomElement$;
var $n_Ljapgolly_scalajs_react_vdom_VdomElement$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_VdomElement$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_VdomElement$)) {
    $n_Ljapgolly_scalajs_react_vdom_VdomElement$ = new $c_Ljapgolly_scalajs_react_vdom_VdomElement$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_VdomElement$
}
function $is_Ljapgolly_scalajs_react_vdom_VdomNode(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_VdomNode)))
}
function $as_Ljapgolly_scalajs_react_vdom_VdomNode(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_VdomNode(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.VdomNode"))
}
function $isArrayOf_Ljapgolly_scalajs_react_vdom_VdomNode(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_VdomNode)))
}
function $asArrayOf_Ljapgolly_scalajs_react_vdom_VdomNode(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_VdomNode(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.VdomNode;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_VdomNode$() {
  $c_O.call(this);
  this.empty$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_VdomNode$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_VdomNode$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype = $c_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype;
$c_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_VdomNode$ = this;
  this.empty$1 = new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar(null);
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_VdomNode$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_VdomNode$: 0
}, false, "japgolly.scalajs.react.vdom.VdomNode$", {
  Ljapgolly_scalajs_react_vdom_VdomNode$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_VdomNode$;
var $n_Ljapgolly_scalajs_react_vdom_VdomNode$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_VdomNode$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_VdomNode$)) {
    $n_Ljapgolly_scalajs_react_vdom_VdomNode$ = new $c_Ljapgolly_scalajs_react_vdom_VdomNode$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_VdomNode$
}
/** @constructor */
function $c_Lorg_scalajs_dom_package$() {
  $c_O.call(this);
  this.ApplicationCache$1 = null;
  this.Blob$1 = null;
  this.BlobPropertyBag$1 = null;
  this.DOMException$1 = null;
  this.Event$1 = null;
  this.EventException$1 = null;
  this.EventSource$1 = null;
  this.FileReader$1 = null;
  this.FormData$1 = null;
  this.KeyboardEvent$1 = null;
  this.MediaError$1 = null;
  this.MutationObserverInit$1 = null;
  this.Node$1 = null;
  this.NodeFilter$1 = null;
  this.PerformanceNavigation$1 = null;
  this.PositionError$1 = null;
  this.Range$1 = null;
  this.TextEvent$1 = null;
  this.TextTrack$1 = null;
  this.URL$1 = null;
  this.VisibilityState$1 = null;
  this.WebSocket$1 = null;
  this.WheelEvent$1 = null;
  this.XMLHttpRequest$1 = null;
  this.XPathResult$1 = null;
  this.window$1 = null;
  this.document$1 = null;
  this.console$1 = null;
  this.bitmap$0$1 = 0
}
$c_Lorg_scalajs_dom_package$.prototype = new $h_O();
$c_Lorg_scalajs_dom_package$.prototype.constructor = $c_Lorg_scalajs_dom_package$;
/** @constructor */
function $h_Lorg_scalajs_dom_package$() {
  /*<skip>*/
}
$h_Lorg_scalajs_dom_package$.prototype = $c_Lorg_scalajs_dom_package$.prototype;
$c_Lorg_scalajs_dom_package$.prototype.init___ = (function() {
  return this
});
$c_Lorg_scalajs_dom_package$.prototype.document__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  return (((67108864 & this.bitmap$0$1) === 0) ? this.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument() : this.document$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window__Lorg_scalajs_dom_raw_Window = (function() {
  return (((33554432 & this.bitmap$0$1) === 0) ? this.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window() : this.window$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window = (function() {
  if (((33554432 & this.bitmap$0$1) === 0)) {
    this.window$1 = $g.window;
    this.bitmap$0$1 = (33554432 | this.bitmap$0$1)
  };
  return this.window$1
});
$c_Lorg_scalajs_dom_package$.prototype.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  if (((67108864 & this.bitmap$0$1) === 0)) {
    this.document$1 = this.window__Lorg_scalajs_dom_raw_Window().document;
    this.bitmap$0$1 = (67108864 | this.bitmap$0$1)
  };
  return this.document$1
});
var $d_Lorg_scalajs_dom_package$ = new $TypeData().initClass({
  Lorg_scalajs_dom_package$: 0
}, false, "org.scalajs.dom.package$", {
  Lorg_scalajs_dom_package$: 1,
  O: 1
});
$c_Lorg_scalajs_dom_package$.prototype.$classData = $d_Lorg_scalajs_dom_package$;
var $n_Lorg_scalajs_dom_package$ = (void 0);
function $m_Lorg_scalajs_dom_package$() {
  if ((!$n_Lorg_scalajs_dom_package$)) {
    $n_Lorg_scalajs_dom_package$ = new $c_Lorg_scalajs_dom_package$().init___()
  };
  return $n_Lorg_scalajs_dom_package$
}
/** @constructor */
function $c_Lshared_PresentationUtil$() {
  $c_O.call(this);
  this.font$1 = null;
  this.dataBackground$1 = null;
  this.dataBackgroundColor$1 = null;
  this.dataBackgroundSize$1 = null;
  this.dataTrim$1 = null;
  this.dataNoEscape$1 = null;
  this.ChapterSlideProps$1 = null
}
$c_Lshared_PresentationUtil$.prototype = new $h_O();
$c_Lshared_PresentationUtil$.prototype.constructor = $c_Lshared_PresentationUtil$;
/** @constructor */
function $h_Lshared_PresentationUtil$() {
  /*<skip>*/
}
$h_Lshared_PresentationUtil$.prototype = $c_Lshared_PresentationUtil$.prototype;
$c_Lshared_PresentationUtil$.prototype.init___ = (function() {
  $n_Lshared_PresentationUtil$ = this;
  var this$1 = $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  this.font$1 = "font";
  this.dataBackground$1 = ($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("data-background"));
  this.dataBackgroundColor$1 = ($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("data-background-color"));
  this.dataBackgroundSize$1 = ($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("data-background-size"));
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  var this$7 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("data-trim");
  var t = $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2;
  this.dataTrim$1 = $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod(t, this$7.attrName$1, "");
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  var this$9 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("data-noescape");
  var t$1 = $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2;
  this.dataNoEscape$1 = $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod(t$1, this$9.attrName$1, "");
  var jsx$1 = $m_s_package$().Seq$1;
  var array = [this.dataBackgroundColor$1.$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("#363633", $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2), this.dataBackgroundSize$1.$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("30%", $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2)];
  this.ChapterSlideProps$1 = $as_sci_Seq(jsx$1.apply__sci_Seq__sc_SeqOps(new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array)));
  return this
});
$c_Lshared_PresentationUtil$.prototype.noHeaderSlide__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf = (function(content) {
  return this.cleanSlide__p1__Ljapgolly_scalajs_react_vdom_TagOf__Ljapgolly_scalajs_react_vdom_TagOf($m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf(($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_Exports$(), "section"), content))
});
$c_Lshared_PresentationUtil$.prototype.cleanSlide__p1__Ljapgolly_scalajs_react_vdom_TagOf__Ljapgolly_scalajs_react_vdom_TagOf = (function(content) {
  this.removeHeader__p1__V();
  return content
});
$c_Lshared_PresentationUtil$.prototype.rawCodeFragment__p1__T__T__Ljapgolly_scalajs_react_vdom_TagOf = (function(language, codeStr) {
  var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("fragment fade-in", $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2), this.rawCode__p1__T__T__Ljapgolly_scalajs_react_vdom_TagOf(language, codeStr)];
  return jsx$1.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("pre", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array))
});
$c_Lshared_PresentationUtil$.prototype.rawCode__p1__T__T__Ljapgolly_scalajs_react_vdom_TagOf = (function(language, codeStr) {
  var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod(language, $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2), this.dataTrim$1, this.dataNoEscape$1, ($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar(codeStr))];
  return jsx$1.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("code", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array))
});
$c_Lshared_PresentationUtil$.prototype.scalaC__T__Ljapgolly_scalajs_react_vdom_TagOf = (function(codeStr) {
  var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array = [this.rawCode__p1__T__T__Ljapgolly_scalajs_react_vdom_TagOf("Scala", codeStr)];
  return jsx$1.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("pre", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array))
});
$c_Lshared_PresentationUtil$.prototype.header__T__T__Ljapgolly_scalajs_react_vdom_TagOf = (function(text, cls) {
  var jsx$3 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var jsx$2 = ($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod(cls, $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2);
  var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar(text))];
  var array$1 = [jsx$2, jsx$1.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("p", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array))];
  return jsx$3.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("div", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$1))
});
$c_Lshared_PresentationUtil$.prototype.chapterSlide__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf = (function(content) {
  var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var rassoc$1 = this.ChapterSlideProps$1;
  return this.cleanSlide__p1__Ljapgolly_scalajs_react_vdom_TagOf__Ljapgolly_scalajs_react_vdom_TagOf(jsx$1.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("section", $as_sci_Seq(content.prependedAll__sc_IterableOnce__O(rassoc$1))))
});
$c_Lshared_PresentationUtil$.prototype.removeHeader__p1__V = (function() {
  var headerElements = $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().getElementsByClassName("slide-header");
  var end = $uI(headerElements.length);
  var isEmpty$4 = (end <= 0);
  var scala$collection$immutable$Range$$lastElement$f = (((-1) + end) | 0);
  if ((!isEmpty$4)) {
    var i = 0;
    while (true) {
      var arg1 = i;
      var element = headerElements[arg1];
      element.parentNode.removeChild(element);
      if ((i === scala$collection$immutable$Range$$lastElement$f)) {
        break
      };
      i = ((1 + i) | 0)
    }
  }
});
$c_Lshared_PresentationUtil$.prototype.chapter__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf = (function(slides) {
  return $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf(($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_Exports$(), "section"), slides)
});
$c_Lshared_PresentationUtil$.prototype.headerSlide__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf = (function(headerStr, content) {
  var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var rassoc$2 = this.header__T__T__Ljapgolly_scalajs_react_vdom_TagOf(headerStr, "slide-header");
  return this.cleanSlide__p1__Ljapgolly_scalajs_react_vdom_TagOf__Ljapgolly_scalajs_react_vdom_TagOf(jsx$1.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("section", $as_sci_Seq(content.prepended__O__O(rassoc$2))))
});
var $d_Lshared_PresentationUtil$ = new $TypeData().initClass({
  Lshared_PresentationUtil$: 0
}, false, "shared.PresentationUtil$", {
  Lshared_PresentationUtil$: 1,
  O: 1
});
$c_Lshared_PresentationUtil$.prototype.$classData = $d_Lshared_PresentationUtil$;
var $n_Lshared_PresentationUtil$ = (void 0);
function $m_Lshared_PresentationUtil$() {
  if ((!$n_Lshared_PresentationUtil$)) {
    $n_Lshared_PresentationUtil$ = new $c_Lshared_PresentationUtil$().init___()
  };
  return $n_Lshared_PresentationUtil$
}
/** @constructor */
function $c_Lshared_PresentationUtil$Enumeration$() {
  $c_O.call(this)
}
$c_Lshared_PresentationUtil$Enumeration$.prototype = new $h_O();
$c_Lshared_PresentationUtil$Enumeration$.prototype.constructor = $c_Lshared_PresentationUtil$Enumeration$;
/** @constructor */
function $h_Lshared_PresentationUtil$Enumeration$() {
  /*<skip>*/
}
$h_Lshared_PresentationUtil$Enumeration$.prototype = $c_Lshared_PresentationUtil$Enumeration$.prototype;
$c_Lshared_PresentationUtil$Enumeration$.prototype.init___ = (function() {
  return this
});
$c_Lshared_PresentationUtil$Enumeration$.prototype.apply__Ljapgolly_scalajs_react_vdom_TagOf__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf = (function(head, tail) {
  return $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf(($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_Exports$(), "ul"), $as_sci_Seq(tail.prepended__O__O(head)))
});
var $d_Lshared_PresentationUtil$Enumeration$ = new $TypeData().initClass({
  Lshared_PresentationUtil$Enumeration$: 0
}, false, "shared.PresentationUtil$Enumeration$", {
  Lshared_PresentationUtil$Enumeration$: 1,
  O: 1
});
$c_Lshared_PresentationUtil$Enumeration$.prototype.$classData = $d_Lshared_PresentationUtil$Enumeration$;
var $n_Lshared_PresentationUtil$Enumeration$ = (void 0);
function $m_Lshared_PresentationUtil$Enumeration$() {
  if ((!$n_Lshared_PresentationUtil$Enumeration$)) {
    $n_Lshared_PresentationUtil$Enumeration$ = new $c_Lshared_PresentationUtil$Enumeration$().init___()
  };
  return $n_Lshared_PresentationUtil$Enumeration$
}
/** @constructor */
function $c_Lshared_PresentationUtil$Enumeration$Item$() {
  $c_O.call(this)
}
$c_Lshared_PresentationUtil$Enumeration$Item$.prototype = new $h_O();
$c_Lshared_PresentationUtil$Enumeration$Item$.prototype.constructor = $c_Lshared_PresentationUtil$Enumeration$Item$;
/** @constructor */
function $h_Lshared_PresentationUtil$Enumeration$Item$() {
  /*<skip>*/
}
$h_Lshared_PresentationUtil$Enumeration$Item$.prototype = $c_Lshared_PresentationUtil$Enumeration$Item$.prototype;
$c_Lshared_PresentationUtil$Enumeration$Item$.prototype.init___ = (function() {
  return this
});
$c_Lshared_PresentationUtil$Enumeration$Item$.prototype.stable__T__Ljapgolly_scalajs_react_vdom_TagOf = (function(content) {
  var jsx$2 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar(content))];
  var array$1 = [jsx$1.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("p", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array))];
  return jsx$2.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("li", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$1))
});
$c_Lshared_PresentationUtil$Enumeration$Item$.prototype.fadeIn__T__Ljapgolly_scalajs_react_vdom_TagOf = (function(content) {
  var jsx$3 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var jsx$2 = ($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("fragment fade-in", $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2);
  var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar(content))];
  var array$1 = [jsx$2, jsx$1.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("p", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array))];
  return jsx$3.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("li", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$1))
});
var $d_Lshared_PresentationUtil$Enumeration$Item$ = new $TypeData().initClass({
  Lshared_PresentationUtil$Enumeration$Item$: 0
}, false, "shared.PresentationUtil$Enumeration$Item$", {
  Lshared_PresentationUtil$Enumeration$Item$: 1,
  O: 1
});
$c_Lshared_PresentationUtil$Enumeration$Item$.prototype.$classData = $d_Lshared_PresentationUtil$Enumeration$Item$;
var $n_Lshared_PresentationUtil$Enumeration$Item$ = (void 0);
function $m_Lshared_PresentationUtil$Enumeration$Item$() {
  if ((!$n_Lshared_PresentationUtil$Enumeration$Item$)) {
    $n_Lshared_PresentationUtil$Enumeration$Item$ = new $c_Lshared_PresentationUtil$Enumeration$Item$().init___()
  };
  return $n_Lshared_PresentationUtil$Enumeration$Item$
}
/** @constructor */
function $c_jl_Class() {
  $c_O.call(this);
  this.data$1 = null
}
$c_jl_Class.prototype = new $h_O();
$c_jl_Class.prototype.constructor = $c_jl_Class;
/** @constructor */
function $h_jl_Class() {
  /*<skip>*/
}
$h_jl_Class.prototype = $c_jl_Class.prototype;
$c_jl_Class.prototype.getName__T = (function() {
  return $as_T(this.data$1.name)
});
$c_jl_Class.prototype.getComponentType__jl_Class = (function() {
  return $as_jl_Class(this.data$1.getComponentType())
});
$c_jl_Class.prototype.isPrimitive__Z = (function() {
  return $uZ(this.data$1.isPrimitive)
});
$c_jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
$c_jl_Class.prototype.isAssignableFrom__jl_Class__Z = (function(that) {
  return ((this.isPrimitive__Z() || that.isPrimitive__Z()) ? ((this === that) || ((this === $d_S.getClassOf()) ? (that === $d_B.getClassOf()) : ((this === $d_I.getClassOf()) ? ((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) : ((this === $d_F.getClassOf()) ? (((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) : ((this === $d_D.getClassOf()) && ((((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) || (that === $d_F.getClassOf()))))))) : this.isInstance__O__Z(that.getFakeInstance__p1__O()))
});
$c_jl_Class.prototype.isInstance__O__Z = (function(obj) {
  return $uZ(this.data$1.isInstance(obj))
});
$c_jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
$c_jl_Class.prototype.getFakeInstance__p1__O = (function() {
  return this.data$1.getFakeInstance()
});
$c_jl_Class.prototype.newArrayOfThisClass__sjs_js_Array__O = (function(dimensions) {
  return this.data$1.newArrayOfThisClass(dimensions)
});
$c_jl_Class.prototype.isArray__Z = (function() {
  return $uZ(this.data$1.isArrayClass)
});
$c_jl_Class.prototype.isInterface__Z = (function() {
  return $uZ(this.data$1.isInterface)
});
function $as_jl_Class(obj) {
  return (((obj instanceof $c_jl_Class) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Class"))
}
function $isArrayOf_jl_Class(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Class)))
}
function $asArrayOf_jl_Class(obj, depth) {
  return (($isArrayOf_jl_Class(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Class;", depth))
}
var $d_jl_Class = new $TypeData().initClass({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
$c_jl_Class.prototype.$classData = $d_jl_Class;
/** @constructor */
function $c_jl_System$() {
  $c_O.call(this);
  this.out$1 = null;
  this.err$1 = null;
  this.in$1 = null;
  this.getHighPrecisionTime$1 = null
}
$c_jl_System$.prototype = new $h_O();
$c_jl_System$.prototype.constructor = $c_jl_System$;
/** @constructor */
function $h_jl_System$() {
  /*<skip>*/
}
$h_jl_System$.prototype = $c_jl_System$.prototype;
$c_jl_System$.prototype.init___ = (function() {
  $n_jl_System$ = this;
  this.out$1 = new $c_jl_JSConsoleBasedPrintStream().init___Z(false);
  this.err$1 = new $c_jl_JSConsoleBasedPrintStream().init___Z(true);
  this.in$1 = null;
  var x = $g.performance;
  if ($uZ((!(!x)))) {
    var x$1 = $g.performance.now;
    if ($uZ((!(!x$1)))) {
      var jsx$1 = (function() {
        return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$1__D()
      })
    } else {
      var x$2 = $g.performance.webkitNow;
      if ($uZ((!(!x$2)))) {
        var jsx$1 = (function() {
          return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$2__D()
        })
      } else {
        var jsx$1 = (function() {
          return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$3__D()
        })
      }
    }
  } else {
    var jsx$1 = (function() {
      return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$4__D()
    })
  };
  this.getHighPrecisionTime$1 = jsx$1;
  return this
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$3__D = (function() {
  return $uD(new $g.Date().getTime())
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$1__D = (function() {
  return $uD($g.performance.now())
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$4__D = (function() {
  return $uD(new $g.Date().getTime())
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$2__D = (function() {
  return $uD($g.performance.webkitNow())
});
var $d_jl_System$ = new $TypeData().initClass({
  jl_System$: 0
}, false, "java.lang.System$", {
  jl_System$: 1,
  O: 1
});
$c_jl_System$.prototype.$classData = $d_jl_System$;
var $n_jl_System$ = (void 0);
function $m_jl_System$() {
  if ((!$n_jl_System$)) {
    $n_jl_System$ = new $c_jl_System$().init___()
  };
  return $n_jl_System$
}
/** @constructor */
function $c_jl_System$SystemProperties$() {
  $c_O.call(this);
  this.value$1 = null
}
$c_jl_System$SystemProperties$.prototype = new $h_O();
$c_jl_System$SystemProperties$.prototype.constructor = $c_jl_System$SystemProperties$;
/** @constructor */
function $h_jl_System$SystemProperties$() {
  /*<skip>*/
}
$h_jl_System$SystemProperties$.prototype = $c_jl_System$SystemProperties$.prototype;
$c_jl_System$SystemProperties$.prototype.init___ = (function() {
  $n_jl_System$SystemProperties$ = this;
  this.value$1 = this.loadSystemProperties__ju_Properties();
  return this
});
$c_jl_System$SystemProperties$.prototype.loadSystemProperties__ju_Properties = (function() {
  var sysProp = new $c_ju_Properties().init___();
  sysProp.put__O__O__O("java.version", "1.8");
  sysProp.put__O__O__O("java.vm.specification.version", "1.8");
  sysProp.put__O__O__O("java.vm.specification.vendor", "Oracle Corporation");
  sysProp.put__O__O__O("java.vm.specification.name", "Java Virtual Machine Specification");
  sysProp.put__O__O__O("java.vm.name", "Scala.js");
  var value = $linkingInfo.linkerVersion;
  if ((value !== (void 0))) {
    var v = $as_T(value);
    sysProp.put__O__O__O("java.vm.version", v)
  };
  sysProp.put__O__O__O("java.specification.version", "1.8");
  sysProp.put__O__O__O("java.specification.vendor", "Oracle Corporation");
  sysProp.put__O__O__O("java.specification.name", "Java Platform API Specification");
  sysProp.put__O__O__O("file.separator", "/");
  sysProp.put__O__O__O("path.separator", ":");
  sysProp.put__O__O__O("line.separator", "\n");
  var value$1 = $env.javaSystemProperties;
  if ((value$1 !== (void 0))) {
    var this$13 = new $c_sjs_js_WrappedDictionary().init___sjs_js_Dictionary(value$1);
    var p = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(check$ifrefutable$1$2) {
        var check$ifrefutable$1 = $as_T2(check$ifrefutable$1$2);
        return (check$ifrefutable$1 !== null)
      })
    })(this));
    var this$14 = new $c_sc_MapOps$WithFilter().init___sc_MapOps__F1(this$13, p);
    var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, sysProp$1) {
      return (function(x$1$2) {
        var x$1 = $as_T2(x$1$2);
        if ((x$1 !== null)) {
          var key = $as_T(x$1.$$und1$f);
          var value$2 = $as_T(x$1.$$und2$f);
          return sysProp$1.put__O__O__O(key, value$2)
        } else {
          throw new $c_s_MatchError().init___O(x$1)
        }
      })
    })(this, sysProp));
    this$14.filtered__sc_Iterable().foreach__F1__V(f)
  };
  return sysProp
});
var $d_jl_System$SystemProperties$ = new $TypeData().initClass({
  jl_System$SystemProperties$: 0
}, false, "java.lang.System$SystemProperties$", {
  jl_System$SystemProperties$: 1,
  O: 1
});
$c_jl_System$SystemProperties$.prototype.$classData = $d_jl_System$SystemProperties$;
var $n_jl_System$SystemProperties$ = (void 0);
function $m_jl_System$SystemProperties$() {
  if ((!$n_jl_System$SystemProperties$)) {
    $n_jl_System$SystemProperties$ = new $c_jl_System$SystemProperties$().init___()
  };
  return $n_jl_System$SystemProperties$
}
/** @constructor */
function $c_jl_reflect_Array$() {
  $c_O.call(this)
}
$c_jl_reflect_Array$.prototype = new $h_O();
$c_jl_reflect_Array$.prototype.constructor = $c_jl_reflect_Array$;
/** @constructor */
function $h_jl_reflect_Array$() {
  /*<skip>*/
}
$h_jl_reflect_Array$.prototype = $c_jl_reflect_Array$.prototype;
$c_jl_reflect_Array$.prototype.init___ = (function() {
  return this
});
$c_jl_reflect_Array$.prototype.getLength__O__I = (function(array) {
  if ($isArrayOf_O(array, 1)) {
    var x2 = $asArrayOf_O(array, 1);
    return x2.u.length
  } else if ($isArrayOf_Z(array, 1)) {
    var x3 = $asArrayOf_Z(array, 1);
    return x3.u.length
  } else if ($isArrayOf_C(array, 1)) {
    var x4 = $asArrayOf_C(array, 1);
    return x4.u.length
  } else if ($isArrayOf_B(array, 1)) {
    var x5 = $asArrayOf_B(array, 1);
    return x5.u.length
  } else if ($isArrayOf_S(array, 1)) {
    var x6 = $asArrayOf_S(array, 1);
    return x6.u.length
  } else if ($isArrayOf_I(array, 1)) {
    var x7 = $asArrayOf_I(array, 1);
    return x7.u.length
  } else if ($isArrayOf_J(array, 1)) {
    var x8 = $asArrayOf_J(array, 1);
    return x8.u.length
  } else if ($isArrayOf_F(array, 1)) {
    var x9 = $asArrayOf_F(array, 1);
    return x9.u.length
  } else if ($isArrayOf_D(array, 1)) {
    var x10 = $asArrayOf_D(array, 1);
    return x10.u.length
  } else {
    throw new $c_jl_IllegalArgumentException().init___T("argument type mismatch")
  }
});
$c_jl_reflect_Array$.prototype.newInstance__jl_Class__I__O = (function(componentType, length) {
  return componentType.newArrayOfThisClass__sjs_js_Array__O([length])
});
var $d_jl_reflect_Array$ = new $TypeData().initClass({
  jl_reflect_Array$: 0
}, false, "java.lang.reflect.Array$", {
  jl_reflect_Array$: 1,
  O: 1
});
$c_jl_reflect_Array$.prototype.$classData = $d_jl_reflect_Array$;
var $n_jl_reflect_Array$ = (void 0);
function $m_jl_reflect_Array$() {
  if ((!$n_jl_reflect_Array$)) {
    $n_jl_reflect_Array$ = new $c_jl_reflect_Array$().init___()
  };
  return $n_jl_reflect_Array$
}
/** @constructor */
function $c_ju_Arrays$() {
  $c_O.call(this)
}
$c_ju_Arrays$.prototype = new $h_O();
$c_ju_Arrays$.prototype.constructor = $c_ju_Arrays$;
/** @constructor */
function $h_ju_Arrays$() {
  /*<skip>*/
}
$h_ju_Arrays$.prototype = $c_ju_Arrays$.prototype;
$c_ju_Arrays$.prototype.init___ = (function() {
  return this
});
$c_ju_Arrays$.prototype.copyOfRange__AO__I__I__AO = (function(original, from, to) {
  var evidence$6 = $m_s_reflect_ClassTag$().apply__jl_Class__s_reflect_ClassTag($objectGetClass(original).getComponentType__jl_Class());
  var len = original.u.length;
  if ((from > to)) {
    throw new $c_jl_IllegalArgumentException().init___T(((from + " > ") + to))
  };
  if (((from < 0) || (from > len))) {
    throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(new $c_jl_ArrayIndexOutOfBoundsException().init___())
  };
  var retLength = ((to - from) | 0);
  var b = ((original.u.length - from) | 0);
  var copyLength = ((retLength < b) ? retLength : b);
  var ret = evidence$6.newArray__I__O(retLength);
  $systemArraycopy(original, from, ret, 0, copyLength);
  return $asArrayOf_O(ret, 1)
});
$c_ju_Arrays$.prototype.binarySearch__AI__I__I = (function(a, key) {
  var startIndex = 0;
  var endIndex = a.u.length;
  _binarySearchImpl: while (true) {
    if ((startIndex === endIndex)) {
      return (((-1) - startIndex) | 0)
    } else {
      var mid = ((((startIndex + endIndex) | 0) >>> 1) | 0);
      var elem = a.get(mid);
      if ((key < elem)) {
        endIndex = mid;
        continue _binarySearchImpl
      } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, elem)) {
        return mid
      } else {
        startIndex = ((1 + mid) | 0);
        continue _binarySearchImpl
      }
    }
  }
});
$c_ju_Arrays$.prototype.copyOf__AO__I__AO = (function(original, newLength) {
  var tagT = $m_s_reflect_ClassTag$().apply__jl_Class__s_reflect_ClassTag($objectGetClass(original).getComponentType__jl_Class());
  if ((newLength < 0)) {
    throw new $c_jl_NegativeArraySizeException().init___()
  };
  var b = original.u.length;
  var copyLength = ((newLength < b) ? newLength : b);
  var ret = tagT.newArray__I__O(newLength);
  $systemArraycopy(original, 0, ret, 0, copyLength);
  return $asArrayOf_O(ret, 1)
});
var $d_ju_Arrays$ = new $TypeData().initClass({
  ju_Arrays$: 0
}, false, "java.util.Arrays$", {
  ju_Arrays$: 1,
  O: 1
});
$c_ju_Arrays$.prototype.$classData = $d_ju_Arrays$;
var $n_ju_Arrays$ = (void 0);
function $m_ju_Arrays$() {
  if ((!$n_ju_Arrays$)) {
    $n_ju_Arrays$ = new $c_ju_Arrays$().init___()
  };
  return $n_ju_Arrays$
}
function $is_ju_Collection(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.ju_Collection)))
}
function $as_ju_Collection(obj) {
  return (($is_ju_Collection(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.util.Collection"))
}
function $isArrayOf_ju_Collection(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.ju_Collection)))
}
function $asArrayOf_ju_Collection(obj, depth) {
  return (($isArrayOf_ju_Collection(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.util.Collection;", depth))
}
/** @constructor */
function $c_ju_Dictionary() {
  $c_O.call(this)
}
$c_ju_Dictionary.prototype = new $h_O();
$c_ju_Dictionary.prototype.constructor = $c_ju_Dictionary;
/** @constructor */
function $h_ju_Dictionary() {
  /*<skip>*/
}
$h_ju_Dictionary.prototype = $c_ju_Dictionary.prototype;
/** @constructor */
function $c_s_math_Ordered$() {
  $c_O.call(this)
}
$c_s_math_Ordered$.prototype = new $h_O();
$c_s_math_Ordered$.prototype.constructor = $c_s_math_Ordered$;
/** @constructor */
function $h_s_math_Ordered$() {
  /*<skip>*/
}
$h_s_math_Ordered$.prototype = $c_s_math_Ordered$.prototype;
$c_s_math_Ordered$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordered$ = new $TypeData().initClass({
  s_math_Ordered$: 0
}, false, "scala.math.Ordered$", {
  s_math_Ordered$: 1,
  O: 1
});
$c_s_math_Ordered$.prototype.$classData = $d_s_math_Ordered$;
var $n_s_math_Ordered$ = (void 0);
function $m_s_math_Ordered$() {
  if ((!$n_s_math_Ordered$)) {
    $n_s_math_Ordered$ = new $c_s_math_Ordered$().init___()
  };
  return $n_s_math_Ordered$
}
/** @constructor */
function $c_s_package$() {
  $c_O.call(this);
  this.BigDecimal$1 = null;
  this.BigInt$1 = null;
  this.AnyRef$1 = null;
  this.Traversable$1 = null;
  this.Iterable$1 = null;
  this.Seq$1 = null;
  this.IndexedSeq$1 = null;
  this.Iterator$1 = null;
  this.List$1 = null;
  this.Nil$1 = null;
  this.$$colon$colon$1 = null;
  this.$$plus$colon$1 = null;
  this.$$colon$plus$1 = null;
  this.Stream$1 = null;
  this.LazyList$1 = null;
  this.Vector$1 = null;
  this.StringBuilder$1 = null;
  this.Range$1 = null;
  this.Equiv$1 = null;
  this.Fractional$1 = null;
  this.Integral$1 = null;
  this.Numeric$1 = null;
  this.Ordered$1 = null;
  this.Ordering$1 = null;
  this.Either$1 = null;
  this.Left$1 = null;
  this.Right$1 = null;
  this.bitmap$0$1 = 0
}
$c_s_package$.prototype = new $h_O();
$c_s_package$.prototype.constructor = $c_s_package$;
/** @constructor */
function $h_s_package$() {
  /*<skip>*/
}
$h_s_package$.prototype = $c_s_package$.prototype;
$c_s_package$.prototype.init___ = (function() {
  $n_s_package$ = this;
  this.AnyRef$1 = new $c_s_package$$anon$1().init___();
  this.Traversable$1 = $m_sc_Iterable$();
  this.Iterable$1 = $m_sc_Iterable$();
  this.Seq$1 = $m_sci_Seq$();
  this.IndexedSeq$1 = $m_sci_IndexedSeq$();
  this.Iterator$1 = $m_sc_Iterator$();
  this.List$1 = $m_sci_List$();
  this.Nil$1 = $m_sci_Nil$();
  this.$$colon$colon$1 = $m_sci_$colon$colon$();
  this.$$plus$colon$1 = $m_sc_package$$plus$colon$();
  this.$$colon$plus$1 = $m_sc_package$$colon$plus$();
  this.Stream$1 = $m_sci_Stream$();
  this.LazyList$1 = $m_sci_LazyList$();
  this.Vector$1 = $m_sci_Vector$();
  this.StringBuilder$1 = $m_scm_StringBuilder$();
  this.Range$1 = $m_sci_Range$();
  this.Equiv$1 = $m_s_math_Equiv$();
  this.Fractional$1 = $m_s_math_Fractional$();
  this.Integral$1 = $m_s_math_Integral$();
  this.Numeric$1 = $m_s_math_Numeric$();
  this.Ordered$1 = $m_s_math_Ordered$();
  this.Ordering$1 = $m_s_math_Ordering$();
  this.Either$1 = $m_s_util_Either$();
  this.Left$1 = $m_s_util_Left$();
  this.Right$1 = $m_s_util_Right$();
  return this
});
var $d_s_package$ = new $TypeData().initClass({
  s_package$: 0
}, false, "scala.package$", {
  s_package$: 1,
  O: 1
});
$c_s_package$.prototype.$classData = $d_s_package$;
var $n_s_package$ = (void 0);
function $m_s_package$() {
  if ((!$n_s_package$)) {
    $n_s_package$ = new $c_s_package$().init___()
  };
  return $n_s_package$
}
/** @constructor */
function $c_s_util_hashing_MurmurHash3() {
  $c_O.call(this)
}
$c_s_util_hashing_MurmurHash3.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3.prototype.constructor = $c_s_util_hashing_MurmurHash3;
/** @constructor */
function $h_s_util_hashing_MurmurHash3() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3.prototype = $c_s_util_hashing_MurmurHash3.prototype;
$c_s_util_hashing_MurmurHash3.prototype.indexedSeqHash__sc_IndexedSeq__I__I = (function(a, seed) {
  var h = seed;
  var l = a.length__I();
  switch (l) {
    case 0: {
      return this.finalizeHash__I__I__I(h, 0);
      break
    }
    case 1: {
      return this.finalizeHash__I__I__I(this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(a.apply__I__O(0))), 1);
      break
    }
    default: {
      var initial = $m_sr_Statics$().anyHash__O__I(a.apply__I__O(0));
      h = this.mix__I__I__I(h, initial);
      var h0 = h;
      var prev = $m_sr_Statics$().anyHash__O__I(a.apply__I__O(1));
      var rangeDiff = ((prev - initial) | 0);
      var i = 2;
      while ((i < l)) {
        h = this.mix__I__I__I(h, prev);
        var hash = $m_sr_Statics$().anyHash__O__I(a.apply__I__O(i));
        if ((rangeDiff !== ((hash - prev) | 0))) {
          h = this.mix__I__I__I(h, hash);
          i = ((1 + i) | 0);
          while ((i < l)) {
            h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(a.apply__I__O(i)));
            i = ((1 + i) | 0)
          };
          return this.finalizeHash__I__I__I(h, l)
        };
        prev = hash;
        i = ((1 + i) | 0)
      };
      return this.scala$util$hashing$MurmurHash3$$avalanche__I__I(this.mix__I__I__I(this.mix__I__I__I(h0, rangeDiff), prev))
    }
  }
});
$c_s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  var i = k;
  k = ((i << 15) | ((i >>> 17) | 0));
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_s_util_hashing_MurmurHash3.prototype.unorderedHash__sc_IterableOnce__I__I = (function(xs, seed) {
  var a = 0;
  var b = 0;
  var n = 0;
  var c = 1;
  var iterator = xs.iterator__sc_Iterator();
  while (iterator.hasNext__Z()) {
    var x = iterator.next__O();
    var h = $m_sr_Statics$().anyHash__O__I(x);
    a = ((a + h) | 0);
    b = (b ^ h);
    c = $imul(c, (1 | h));
    n = ((1 + n) | 0)
  };
  var h$2 = seed;
  h$2 = this.mix__I__I__I(h$2, a);
  h$2 = this.mix__I__I__I(h$2, b);
  h$2 = this.mixLast__I__I__I(h$2, c);
  return this.finalizeHash__I__I__I(h$2, n)
});
$c_s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  var i = h;
  h = ((i << 13) | ((i >>> 19) | 0));
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_s_util_hashing_MurmurHash3.prototype.tuple2Hash__I__I__I__I = (function(x, y, seed) {
  var h = seed;
  h = this.mix__I__I__I(h, $m_sjsr_RuntimeString$().hashCode__T__I("Tuple2"));
  h = this.mix__I__I__I(h, x);
  h = this.mix__I__I__I(h, y);
  return this.finalizeHash__I__I__I(h, 2)
});
$c_s_util_hashing_MurmurHash3.prototype.rangeHash__I__I__I__I__I = (function(start, step, last, seed) {
  return this.scala$util$hashing$MurmurHash3$$avalanche__I__I(this.mix__I__I__I(this.mix__I__I__I(this.mix__I__I__I(seed, start), step), last))
});
$c_s_util_hashing_MurmurHash3.prototype.orderedHash__sc_IterableOnce__I__I = (function(xs, seed) {
  var it = xs.iterator__sc_Iterator();
  var h = seed;
  if ((!it.hasNext__Z())) {
    return this.finalizeHash__I__I__I(h, 0)
  };
  var x0 = it.next__O();
  if ((!it.hasNext__Z())) {
    return this.finalizeHash__I__I__I(this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(x0)), 1)
  };
  var x1 = it.next__O();
  var initial = $m_sr_Statics$().anyHash__O__I(x0);
  h = this.mix__I__I__I(h, initial);
  var h0 = h;
  var prev = $m_sr_Statics$().anyHash__O__I(x1);
  var rangeDiff = ((prev - initial) | 0);
  var i = 2;
  while (it.hasNext__Z()) {
    h = this.mix__I__I__I(h, prev);
    var hash = $m_sr_Statics$().anyHash__O__I(it.next__O());
    if ((rangeDiff !== ((hash - prev) | 0))) {
      h = this.mix__I__I__I(h, hash);
      i = ((1 + i) | 0);
      while (it.hasNext__Z()) {
        h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(it.next__O()));
        i = ((1 + i) | 0)
      };
      return this.finalizeHash__I__I__I(h, i)
    };
    prev = hash;
    i = ((1 + i) | 0)
  };
  return this.scala$util$hashing$MurmurHash3$$avalanche__I__I(this.mix__I__I__I(this.mix__I__I__I(h0, rangeDiff), prev))
});
$c_s_util_hashing_MurmurHash3.prototype.scala$util$hashing$MurmurHash3$$avalanche__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__Z__I = (function(x, seed, ignorePrefix) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return $m_sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    if ((!ignorePrefix)) {
      var jsx$1 = h;
      var this$2 = x.productPrefix__T();
      h = this.mix__I__I__I(jsx$1, $m_sjsr_RuntimeString$().hashCode__T__I(this$2))
    };
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
$c_s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.scala$util$hashing$MurmurHash3$$avalanche__I__I((hash ^ length))
});
$c_s_util_hashing_MurmurHash3.prototype.listHash__sci_List__I__I = (function(xs, seed) {
  var n = 0;
  var h = seed;
  var rangeState = 0;
  var rangeDiff = 0;
  var prev = 0;
  var initial = 0;
  var elems = xs;
  while ((!elems.isEmpty__Z())) {
    var head = elems.head__O();
    var tail = $as_sci_List(elems.tail__O());
    var hash = $m_sr_Statics$().anyHash__O__I(head);
    h = this.mix__I__I__I(h, hash);
    var x1 = rangeState;
    switch (x1) {
      case 0: {
        initial = hash;
        rangeState = 1;
        break
      }
      case 1: {
        rangeDiff = ((hash - prev) | 0);
        rangeState = 2;
        break
      }
      case 2: {
        if ((rangeDiff !== ((hash - prev) | 0))) {
          rangeState = 3
        };
        break
      }
    };
    prev = hash;
    n = ((1 + n) | 0);
    elems = tail
  };
  return ((rangeState === 2) ? this.rangeHash__I__I__I__I__I(initial, rangeDiff, prev, seed) : this.finalizeHash__I__I__I(h, n))
});
/** @constructor */
function $c_sc_Iterator$ConcatIteratorCell() {
  $c_O.call(this);
  this.head$1 = null;
  this.tail$1 = null
}
$c_sc_Iterator$ConcatIteratorCell.prototype = new $h_O();
$c_sc_Iterator$ConcatIteratorCell.prototype.constructor = $c_sc_Iterator$ConcatIteratorCell;
/** @constructor */
function $h_sc_Iterator$ConcatIteratorCell() {
  /*<skip>*/
}
$h_sc_Iterator$ConcatIteratorCell.prototype = $c_sc_Iterator$ConcatIteratorCell.prototype;
$c_sc_Iterator$ConcatIteratorCell.prototype.headIterator__sc_Iterator = (function() {
  return $as_sc_IterableOnce(this.head$1.apply__O()).iterator__sc_Iterator()
});
$c_sc_Iterator$ConcatIteratorCell.prototype.init___F0__sc_Iterator$ConcatIteratorCell = (function(head, tail) {
  this.head$1 = head;
  this.tail$1 = tail;
  return this
});
var $d_sc_Iterator$ConcatIteratorCell = new $TypeData().initClass({
  sc_Iterator$ConcatIteratorCell: 0
}, false, "scala.collection.Iterator$ConcatIteratorCell", {
  sc_Iterator$ConcatIteratorCell: 1,
  O: 1
});
$c_sc_Iterator$ConcatIteratorCell.prototype.$classData = $d_sc_Iterator$ConcatIteratorCell;
/** @constructor */
function $c_sc_LinearSeqIterator$LazyCell() {
  $c_O.call(this);
  this.v$1 = null;
  this.st$1 = null;
  this.bitmap$0$1 = false
}
$c_sc_LinearSeqIterator$LazyCell.prototype = new $h_O();
$c_sc_LinearSeqIterator$LazyCell.prototype.constructor = $c_sc_LinearSeqIterator$LazyCell;
/** @constructor */
function $h_sc_LinearSeqIterator$LazyCell() {
  /*<skip>*/
}
$h_sc_LinearSeqIterator$LazyCell.prototype = $c_sc_LinearSeqIterator$LazyCell.prototype;
$c_sc_LinearSeqIterator$LazyCell.prototype.v$lzycompute__p1__sc_LinearSeqOps = (function() {
  if ((!this.bitmap$0$1)) {
    this.v$1 = $as_sc_LinearSeqOps(this.st$1.apply__O());
    this.bitmap$0$1 = true
  };
  this.st$1 = null;
  return this.v$1
});
$c_sc_LinearSeqIterator$LazyCell.prototype.init___sc_LinearSeqIterator__F0 = (function($$outer, st) {
  this.st$1 = st;
  return this
});
$c_sc_LinearSeqIterator$LazyCell.prototype.v__sc_LinearSeqOps = (function() {
  return ((!this.bitmap$0$1) ? this.v$lzycompute__p1__sc_LinearSeqOps() : this.v$1)
});
var $d_sc_LinearSeqIterator$LazyCell = new $TypeData().initClass({
  sc_LinearSeqIterator$LazyCell: 0
}, false, "scala.collection.LinearSeqIterator$LazyCell", {
  sc_LinearSeqIterator$LazyCell: 1,
  O: 1
});
$c_sc_LinearSeqIterator$LazyCell.prototype.$classData = $d_sc_LinearSeqIterator$LazyCell;
/** @constructor */
function $c_sc_package$$colon$plus$() {
  $c_O.call(this)
}
$c_sc_package$$colon$plus$.prototype = new $h_O();
$c_sc_package$$colon$plus$.prototype.constructor = $c_sc_package$$colon$plus$;
/** @constructor */
function $h_sc_package$$colon$plus$() {
  /*<skip>*/
}
$h_sc_package$$colon$plus$.prototype = $c_sc_package$$colon$plus$.prototype;
$c_sc_package$$colon$plus$.prototype.init___ = (function() {
  return this
});
var $d_sc_package$$colon$plus$ = new $TypeData().initClass({
  sc_package$$colon$plus$: 0
}, false, "scala.collection.package$$colon$plus$", {
  sc_package$$colon$plus$: 1,
  O: 1
});
$c_sc_package$$colon$plus$.prototype.$classData = $d_sc_package$$colon$plus$;
var $n_sc_package$$colon$plus$ = (void 0);
function $m_sc_package$$colon$plus$() {
  if ((!$n_sc_package$$colon$plus$)) {
    $n_sc_package$$colon$plus$ = new $c_sc_package$$colon$plus$().init___()
  };
  return $n_sc_package$$colon$plus$
}
/** @constructor */
function $c_sc_package$$plus$colon$() {
  $c_O.call(this)
}
$c_sc_package$$plus$colon$.prototype = new $h_O();
$c_sc_package$$plus$colon$.prototype.constructor = $c_sc_package$$plus$colon$;
/** @constructor */
function $h_sc_package$$plus$colon$() {
  /*<skip>*/
}
$h_sc_package$$plus$colon$.prototype = $c_sc_package$$plus$colon$.prototype;
$c_sc_package$$plus$colon$.prototype.init___ = (function() {
  return this
});
var $d_sc_package$$plus$colon$ = new $TypeData().initClass({
  sc_package$$plus$colon$: 0
}, false, "scala.collection.package$$plus$colon$", {
  sc_package$$plus$colon$: 1,
  O: 1
});
$c_sc_package$$plus$colon$.prototype.$classData = $d_sc_package$$plus$colon$;
var $n_sc_package$$plus$colon$ = (void 0);
function $m_sc_package$$plus$colon$() {
  if ((!$n_sc_package$$plus$colon$)) {
    $n_sc_package$$plus$colon$ = new $c_sc_package$$plus$colon$().init___()
  };
  return $n_sc_package$$plus$colon$
}
/** @constructor */
function $c_sci_IndexedSeqDefaults$() {
  $c_O.call(this);
  this.defaultApplyPreferredMaxLength$1 = 0
}
$c_sci_IndexedSeqDefaults$.prototype = new $h_O();
$c_sci_IndexedSeqDefaults$.prototype.constructor = $c_sci_IndexedSeqDefaults$;
/** @constructor */
function $h_sci_IndexedSeqDefaults$() {
  /*<skip>*/
}
$h_sci_IndexedSeqDefaults$.prototype = $c_sci_IndexedSeqDefaults$.prototype;
$c_sci_IndexedSeqDefaults$.prototype.init___ = (function() {
  $n_sci_IndexedSeqDefaults$ = this;
  this.defaultApplyPreferredMaxLength$1 = this.liftedTree1$1__p1__I();
  return this
});
$c_sci_IndexedSeqDefaults$.prototype.liftedTree1$1__p1__I = (function() {
  try {
    $m_jl_System$();
    var x = $m_jl_System$SystemProperties$().value$1.getProperty__T__T__T("scala.collection.immutable.IndexedSeq.defaultApplyPreferredMaxLength", "64");
    var this$4 = $m_jl_Integer$();
    return this$4.parseInt__T__I__I(x, 10)
  } catch (e) {
    if ((e instanceof $c_jl_SecurityException)) {
      return 64
    } else {
      throw e
    }
  }
});
var $d_sci_IndexedSeqDefaults$ = new $TypeData().initClass({
  sci_IndexedSeqDefaults$: 0
}, false, "scala.collection.immutable.IndexedSeqDefaults$", {
  sci_IndexedSeqDefaults$: 1,
  O: 1
});
$c_sci_IndexedSeqDefaults$.prototype.$classData = $d_sci_IndexedSeqDefaults$;
var $n_sci_IndexedSeqDefaults$ = (void 0);
function $m_sci_IndexedSeqDefaults$() {
  if ((!$n_sci_IndexedSeqDefaults$)) {
    $n_sci_IndexedSeqDefaults$ = new $c_sci_IndexedSeqDefaults$().init___()
  };
  return $n_sci_IndexedSeqDefaults$
}
/** @constructor */
function $c_sci_LazyList$LazyBuilder$DeferredState() {
  $c_O.call(this);
  this.$$undstate$1 = null
}
$c_sci_LazyList$LazyBuilder$DeferredState.prototype = new $h_O();
$c_sci_LazyList$LazyBuilder$DeferredState.prototype.constructor = $c_sci_LazyList$LazyBuilder$DeferredState;
/** @constructor */
function $h_sci_LazyList$LazyBuilder$DeferredState() {
  /*<skip>*/
}
$h_sci_LazyList$LazyBuilder$DeferredState.prototype = $c_sci_LazyList$LazyBuilder$DeferredState.prototype;
$c_sci_LazyList$LazyBuilder$DeferredState.prototype.init___ = (function() {
  return this
});
$c_sci_LazyList$LazyBuilder$DeferredState.prototype.eval__sci_LazyList$State = (function() {
  var state = this.$$undstate$1;
  if ((state === null)) {
    throw new $c_jl_IllegalStateException().init___T("uninitialized")
  };
  return $as_sci_LazyList$State(state.apply__O())
});
$c_sci_LazyList$LazyBuilder$DeferredState.prototype.init__F0__V = (function(state) {
  if ((this.$$undstate$1 !== null)) {
    throw new $c_jl_IllegalStateException().init___T("already initialized")
  };
  this.$$undstate$1 = state
});
var $d_sci_LazyList$LazyBuilder$DeferredState = new $TypeData().initClass({
  sci_LazyList$LazyBuilder$DeferredState: 0
}, false, "scala.collection.immutable.LazyList$LazyBuilder$DeferredState", {
  sci_LazyList$LazyBuilder$DeferredState: 1,
  O: 1
});
$c_sci_LazyList$LazyBuilder$DeferredState.prototype.$classData = $d_sci_LazyList$LazyBuilder$DeferredState;
function $is_sci_LazyList$State(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_LazyList$State)))
}
function $as_sci_LazyList$State(obj) {
  return (($is_sci_LazyList$State(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.LazyList$State"))
}
function $isArrayOf_sci_LazyList$State(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_LazyList$State)))
}
function $asArrayOf_sci_LazyList$State(obj, depth) {
  return (($isArrayOf_sci_LazyList$State(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.LazyList$State;", depth))
}
/** @constructor */
function $c_sci_VectorSliceBuilder() {
  $c_O.call(this);
  this.lo$1 = 0;
  this.hi$1 = 0;
  this.scala$collection$immutable$VectorSliceBuilder$$slices$f = null;
  this.len$1 = 0;
  this.pos$1 = 0;
  this.maxDim$1 = 0
}
$c_sci_VectorSliceBuilder.prototype = new $h_O();
$c_sci_VectorSliceBuilder.prototype.constructor = $c_sci_VectorSliceBuilder;
/** @constructor */
function $h_sci_VectorSliceBuilder() {
  /*<skip>*/
}
$h_sci_VectorSliceBuilder.prototype = $c_sci_VectorSliceBuilder.prototype;
$c_sci_VectorSliceBuilder.prototype.add__p1__I__AO__V = (function(n, a) {
  if ((n <= this.maxDim$1)) {
    var idx = ((11 - n) | 0)
  } else {
    this.maxDim$1 = n;
    var idx = (((-1) + n) | 0)
  };
  this.scala$collection$immutable$VectorSliceBuilder$$slices$f.set(idx, a)
});
$c_sci_VectorSliceBuilder.prototype.toString__T = (function() {
  return (((((((((("VectorSliceBuilder(lo=" + this.lo$1) + ", hi=") + this.hi$1) + ", len=") + this.len$1) + ", pos=") + this.pos$1) + ", maxDim=") + this.maxDim$1) + ")")
});
$c_sci_VectorSliceBuilder.prototype.init___I__I = (function(lo, hi) {
  this.lo$1 = lo;
  this.hi$1 = hi;
  this.scala$collection$immutable$VectorSliceBuilder$$slices$f = $newArrayObject($d_O.getArrayOf().getArrayOf(), [11]);
  this.len$1 = 0;
  this.pos$1 = 0;
  this.maxDim$1 = 0;
  return this
});
$c_sci_VectorSliceBuilder.prototype.consider__I__AO__V = (function(n, a) {
  var count = $imul(a.u.length, (1 << $imul(5, (((-1) + n) | 0))));
  var a$1 = ((this.lo$1 - this.pos$1) | 0);
  var lo0 = ((a$1 > 0) ? a$1 : 0);
  var a$2 = ((this.hi$1 - this.pos$1) | 0);
  var hi0 = ((a$2 < count) ? a$2 : count);
  if ((hi0 > lo0)) {
    this.addSlice__p1__I__AO__I__I__V(n, a, lo0, hi0);
    this.len$1 = ((this.len$1 + ((hi0 - lo0) | 0)) | 0)
  };
  this.pos$1 = ((this.pos$1 + count) | 0)
});
$c_sci_VectorSliceBuilder.prototype.addSlice__p1__I__AO__I__I__V = (function(n, a, lo, hi) {
  _addSlice: while (true) {
    if ((n === 1)) {
      var a$1 = a;
      var start = lo;
      var end = hi;
      this.add__p1__I__AO__V(1, (((start === 0) && (end === a$1.u.length)) ? a$1 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$1, start, end)))
    } else {
      var bitsN = $imul(5, (((-1) + n) | 0));
      var widthN = (1 << bitsN);
      var loN = ((lo >>> bitsN) | 0);
      var hiN = ((hi >>> bitsN) | 0);
      var loRest = (lo & (((-1) + widthN) | 0));
      var hiRest = (hi & (((-1) + widthN) | 0));
      if ((loRest === 0)) {
        if ((hiRest === 0)) {
          var jsx$1 = n;
          var a$2 = a;
          this.add__p1__I__AO__V(jsx$1, (((loN === 0) && (hiN === a$2.u.length)) ? a$2 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$2, loN, hiN)))
        } else {
          if ((hiN > loN)) {
            var jsx$2 = n;
            var a$3 = a;
            this.add__p1__I__AO__V(jsx$2, (((loN === 0) && (hiN === a$3.u.length)) ? a$3 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$3, loN, hiN)))
          };
          var temp$n = (((-1) + n) | 0);
          var temp$a = $asArrayOf_O(a.get(hiN), 1);
          n = temp$n;
          a = temp$a;
          lo = 0;
          hi = hiRest;
          continue _addSlice
        }
      } else if ((hiN === loN)) {
        var temp$n$2 = (((-1) + n) | 0);
        var temp$a$2 = $asArrayOf_O(a.get(loN), 1);
        n = temp$n$2;
        a = temp$a$2;
        lo = loRest;
        hi = hiRest;
        continue _addSlice
      } else {
        this.addSlice__p1__I__AO__I__I__V((((-1) + n) | 0), $asArrayOf_O(a.get(loN), 1), loRest, widthN);
        if ((hiRest === 0)) {
          if ((hiN > ((1 + loN) | 0))) {
            var jsx$3 = n;
            var a$4 = a;
            var start$1 = ((1 + loN) | 0);
            this.add__p1__I__AO__V(jsx$3, (((start$1 === 0) && (hiN === a$4.u.length)) ? a$4 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$4, start$1, hiN)))
          }
        } else {
          if ((hiN > ((1 + loN) | 0))) {
            var jsx$4 = n;
            var a$5 = a;
            var start$2 = ((1 + loN) | 0);
            this.add__p1__I__AO__V(jsx$4, (((start$2 === 0) && (hiN === a$5.u.length)) ? a$5 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$5, start$2, hiN)))
          };
          var temp$n$3 = (((-1) + n) | 0);
          var temp$a$3 = $asArrayOf_O(a.get(hiN), 1);
          n = temp$n$3;
          a = temp$a$3;
          lo = 0;
          hi = hiRest;
          continue _addSlice
        }
      }
    };
    break
  }
});
$c_sci_VectorSliceBuilder.prototype.result__sci_Vector = (function() {
  if ((this.len$1 <= 32)) {
    if ((this.len$1 === 0)) {
      return $m_sci_Vector0$()
    } else {
      var prefix1 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(0);
      var suffix1 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(10);
      if ((prefix1 !== null)) {
        if ((suffix1 !== null)) {
          var dest = $m_ju_Arrays$().copyOf__AO__I__AO(prefix1, ((prefix1.u.length + suffix1.u.length) | 0));
          $systemArraycopy(suffix1, 0, dest, prefix1.u.length, suffix1.u.length);
          var a = dest
        } else {
          var a = prefix1
        }
      } else if ((suffix1 !== null)) {
        var a = suffix1
      } else {
        var prefix2 = $asArrayOf_O(this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(1), 2);
        if ((prefix2 !== null)) {
          var a = prefix2.get(0)
        } else {
          var suffix2 = $asArrayOf_O(this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(9), 2);
          var a = suffix2.get(0)
        }
      };
      return new $c_sci_Vector1().init___AO(a)
    }
  } else {
    this.balancePrefix__p1__I__V(1);
    this.balanceSuffix__p1__I__V(1);
    var resultDim = this.maxDim$1;
    if ((resultDim < 6)) {
      var jsx$1 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
      var n = this.maxDim$1;
      var pre = jsx$1.get((((-1) + n) | 0));
      var jsx$2 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
      var n$1 = this.maxDim$1;
      var suf = jsx$2.get(((11 - n$1) | 0));
      if (((pre !== null) && (suf !== null))) {
        if ((((pre.u.length + suf.u.length) | 0) <= 30)) {
          var jsx$3 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
          var n$2 = this.maxDim$1;
          var dest$1 = $m_ju_Arrays$().copyOf__AO__I__AO(pre, ((pre.u.length + suf.u.length) | 0));
          $systemArraycopy(suf, 0, dest$1, pre.u.length, suf.u.length);
          jsx$3.set((((-1) + n$2) | 0), dest$1);
          var jsx$4 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
          var n$3 = this.maxDim$1;
          jsx$4.set(((11 - n$3) | 0), null)
        } else {
          resultDim = ((1 + resultDim) | 0)
        }
      } else {
        var one = ((pre !== null) ? pre : suf);
        if ((one.u.length > 30)) {
          resultDim = ((1 + resultDim) | 0)
        }
      }
    };
    var prefix1$2 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(0);
    var suffix1$2 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(10);
    var len1 = prefix1$2.u.length;
    var x1 = resultDim;
    switch (x1) {
      case 2: {
        var a$1 = $m_sci_VectorStatics$().empty2$1;
        var p = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(1);
        if ((p !== null)) {
          var jsx$5 = p
        } else {
          var s = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(9);
          var jsx$5 = ((s !== null) ? s : a$1)
        };
        var data2 = $asArrayOf_O(jsx$5, 2);
        var res = new $c_sci_Vector2().init___AO__I__AAO__AO__I(prefix1$2, len1, data2, suffix1$2, this.len$1);
        break
      }
      case 3: {
        var a$2 = $m_sci_VectorStatics$().empty2$1;
        var p$1 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(1);
        var prefix2$2 = $asArrayOf_O(((p$1 !== null) ? p$1 : a$2), 2);
        var a$3 = $m_sci_VectorStatics$().empty3$1;
        var p$2 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(2);
        if ((p$2 !== null)) {
          var jsx$6 = p$2
        } else {
          var s$1 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(8);
          var jsx$6 = ((s$1 !== null) ? s$1 : a$3)
        };
        var data3 = $asArrayOf_O(jsx$6, 3);
        var a$4 = $m_sci_VectorStatics$().empty2$1;
        var s$2 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(9);
        var suffix2$2 = $asArrayOf_O(((s$2 !== null) ? s$2 : a$4), 2);
        var len12 = ((len1 + (prefix2$2.u.length << 5)) | 0);
        var res = new $c_sci_Vector3().init___AO__I__AAO__I__AAAO__AAO__AO__I(prefix1$2, len1, prefix2$2, len12, data3, suffix2$2, suffix1$2, this.len$1);
        break
      }
      case 4: {
        var a$5 = $m_sci_VectorStatics$().empty2$1;
        var p$3 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(1);
        var prefix2$3 = $asArrayOf_O(((p$3 !== null) ? p$3 : a$5), 2);
        var a$6 = $m_sci_VectorStatics$().empty3$1;
        var p$4 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(2);
        var prefix3 = $asArrayOf_O(((p$4 !== null) ? p$4 : a$6), 3);
        var a$7 = $m_sci_VectorStatics$().empty4$1;
        var p$5 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(3);
        if ((p$5 !== null)) {
          var jsx$7 = p$5
        } else {
          var s$3 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(7);
          var jsx$7 = ((s$3 !== null) ? s$3 : a$7)
        };
        var data4 = $asArrayOf_O(jsx$7, 4);
        var a$8 = $m_sci_VectorStatics$().empty3$1;
        var s$4 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(8);
        var suffix3 = $asArrayOf_O(((s$4 !== null) ? s$4 : a$8), 3);
        var a$9 = $m_sci_VectorStatics$().empty2$1;
        var s$5 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(9);
        var suffix2$3 = $asArrayOf_O(((s$5 !== null) ? s$5 : a$9), 2);
        var len12$2 = ((len1 + (prefix2$3.u.length << 5)) | 0);
        var len123 = ((len12$2 + (prefix3.u.length << 10)) | 0);
        var res = new $c_sci_Vector4().init___AO__I__AAO__I__AAAO__I__AAAAO__AAAO__AAO__AO__I(prefix1$2, len1, prefix2$3, len12$2, prefix3, len123, data4, suffix3, suffix2$3, suffix1$2, this.len$1);
        break
      }
      case 5: {
        var a$10 = $m_sci_VectorStatics$().empty2$1;
        var p$6 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(1);
        var prefix2$4 = $asArrayOf_O(((p$6 !== null) ? p$6 : a$10), 2);
        var a$11 = $m_sci_VectorStatics$().empty3$1;
        var p$7 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(2);
        var prefix3$2 = $asArrayOf_O(((p$7 !== null) ? p$7 : a$11), 3);
        var a$12 = $m_sci_VectorStatics$().empty4$1;
        var p$8 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(3);
        var prefix4 = $asArrayOf_O(((p$8 !== null) ? p$8 : a$12), 4);
        var a$13 = $m_sci_VectorStatics$().empty5$1;
        var p$9 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(4);
        if ((p$9 !== null)) {
          var jsx$8 = p$9
        } else {
          var s$6 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(6);
          var jsx$8 = ((s$6 !== null) ? s$6 : a$13)
        };
        var data5 = $asArrayOf_O(jsx$8, 5);
        var a$14 = $m_sci_VectorStatics$().empty4$1;
        var s$7 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(7);
        var suffix4 = $asArrayOf_O(((s$7 !== null) ? s$7 : a$14), 4);
        var a$15 = $m_sci_VectorStatics$().empty3$1;
        var s$8 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(8);
        var suffix3$2 = $asArrayOf_O(((s$8 !== null) ? s$8 : a$15), 3);
        var a$16 = $m_sci_VectorStatics$().empty2$1;
        var s$9 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(9);
        var suffix2$4 = $asArrayOf_O(((s$9 !== null) ? s$9 : a$16), 2);
        var len12$3 = ((len1 + (prefix2$4.u.length << 5)) | 0);
        var len123$2 = ((len12$3 + (prefix3$2.u.length << 10)) | 0);
        var len1234 = ((len123$2 + (prefix4.u.length << 15)) | 0);
        var res = new $c_sci_Vector5().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__AAAAO__AAAO__AAO__AO__I(prefix1$2, len1, prefix2$4, len12$3, prefix3$2, len123$2, prefix4, len1234, data5, suffix4, suffix3$2, suffix2$4, suffix1$2, this.len$1);
        break
      }
      case 6: {
        var a$17 = $m_sci_VectorStatics$().empty2$1;
        var p$10 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(1);
        var prefix2$5 = $asArrayOf_O(((p$10 !== null) ? p$10 : a$17), 2);
        var a$18 = $m_sci_VectorStatics$().empty3$1;
        var p$11 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(2);
        var prefix3$3 = $asArrayOf_O(((p$11 !== null) ? p$11 : a$18), 3);
        var a$19 = $m_sci_VectorStatics$().empty4$1;
        var p$12 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(3);
        var prefix4$2 = $asArrayOf_O(((p$12 !== null) ? p$12 : a$19), 4);
        var a$20 = $m_sci_VectorStatics$().empty5$1;
        var p$13 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(4);
        var prefix5 = $asArrayOf_O(((p$13 !== null) ? p$13 : a$20), 5);
        var a$21 = $m_sci_VectorStatics$().empty6$1;
        var p$14 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(5);
        if ((p$14 !== null)) {
          var jsx$9 = p$14
        } else {
          var s$10 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(5);
          var jsx$9 = ((s$10 !== null) ? s$10 : a$21)
        };
        var data6 = $asArrayOf_O(jsx$9, 6);
        var a$22 = $m_sci_VectorStatics$().empty5$1;
        var s$11 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(6);
        var suffix5 = $asArrayOf_O(((s$11 !== null) ? s$11 : a$22), 5);
        var a$23 = $m_sci_VectorStatics$().empty4$1;
        var s$12 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(7);
        var suffix4$2 = $asArrayOf_O(((s$12 !== null) ? s$12 : a$23), 4);
        var a$24 = $m_sci_VectorStatics$().empty3$1;
        var s$13 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(8);
        var suffix3$3 = $asArrayOf_O(((s$13 !== null) ? s$13 : a$24), 3);
        var a$25 = $m_sci_VectorStatics$().empty2$1;
        var s$14 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(9);
        var suffix2$5 = $asArrayOf_O(((s$14 !== null) ? s$14 : a$25), 2);
        var len12$4 = ((len1 + (prefix2$5.u.length << 5)) | 0);
        var len123$3 = ((len12$4 + (prefix3$3.u.length << 10)) | 0);
        var len1234$2 = ((len123$3 + (prefix4$2.u.length << 15)) | 0);
        var len12345 = ((len1234$2 + (prefix5.u.length << 20)) | 0);
        var res = new $c_sci_Vector6().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__I__AAAAAAO__AAAAAO__AAAAO__AAAO__AAO__AO__I(prefix1$2, len1, prefix2$5, len12$4, prefix3$3, len123$3, prefix4$2, len1234$2, prefix5, len12345, data6, suffix5, suffix4$2, suffix3$3, suffix2$5, suffix1$2, this.len$1);
        break
      }
      default: {
        var res;
        throw new $c_s_MatchError().init___O(x1)
      }
    };
    return res
  }
});
$c_sci_VectorSliceBuilder.prototype.balanceSuffix__p1__I__V = (function(n) {
  if ((this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(((11 - n) | 0)) === null)) {
    if ((n === this.maxDim$1)) {
      this.scala$collection$immutable$VectorSliceBuilder$$slices$f.set(((11 - n) | 0), this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get((((-1) + n) | 0)));
      this.scala$collection$immutable$VectorSliceBuilder$$slices$f.set((((-1) + n) | 0), null)
    } else {
      this.balanceSuffix__p1__I__V(((1 + n) | 0));
      var jsx$1 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
      var n$1 = ((1 + n) | 0);
      var sufN1 = $asArrayOf_O(jsx$1.get(((11 - n$1) | 0)), 2);
      this.scala$collection$immutable$VectorSliceBuilder$$slices$f.set(((11 - n) | 0), sufN1.get((((-1) + sufN1.u.length) | 0)));
      if ((sufN1.u.length === 1)) {
        var jsx$2 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
        var n$2 = ((1 + n) | 0);
        jsx$2.set(((11 - n$2) | 0), null);
        if ((this.maxDim$1 === ((1 + n) | 0))) {
          var jsx$4 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
          var n$3 = ((1 + n) | 0);
          var jsx$3 = (jsx$4.get((((-1) + n$3) | 0)) === null)
        } else {
          var jsx$3 = false
        };
        if (jsx$3) {
          this.maxDim$1 = n
        }
      } else {
        var jsx$5 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
        var n$4 = ((1 + n) | 0);
        jsx$5.set(((11 - n$4) | 0), $m_ju_Arrays$().copyOfRange__AO__I__I__AO(sufN1, 0, (((-1) + sufN1.u.length) | 0)))
      }
    }
  }
});
$c_sci_VectorSliceBuilder.prototype.balancePrefix__p1__I__V = (function(n) {
  if ((this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get((((-1) + n) | 0)) === null)) {
    if ((n === this.maxDim$1)) {
      this.scala$collection$immutable$VectorSliceBuilder$$slices$f.set((((-1) + n) | 0), this.scala$collection$immutable$VectorSliceBuilder$$slices$f.get(((11 - n) | 0)));
      this.scala$collection$immutable$VectorSliceBuilder$$slices$f.set(((11 - n) | 0), null)
    } else {
      this.balancePrefix__p1__I__V(((1 + n) | 0));
      var jsx$1 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
      var n$1 = ((1 + n) | 0);
      var preN1 = $asArrayOf_O(jsx$1.get((((-1) + n$1) | 0)), 2);
      this.scala$collection$immutable$VectorSliceBuilder$$slices$f.set((((-1) + n) | 0), preN1.get(0));
      if ((preN1.u.length === 1)) {
        var jsx$2 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
        var n$2 = ((1 + n) | 0);
        jsx$2.set((((-1) + n$2) | 0), null);
        if ((this.maxDim$1 === ((1 + n) | 0))) {
          var jsx$4 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
          var n$3 = ((1 + n) | 0);
          var jsx$3 = (jsx$4.get(((11 - n$3) | 0)) === null)
        } else {
          var jsx$3 = false
        };
        if (jsx$3) {
          this.maxDim$1 = n
        }
      } else {
        var jsx$5 = this.scala$collection$immutable$VectorSliceBuilder$$slices$f;
        var n$4 = ((1 + n) | 0);
        jsx$5.set((((-1) + n$4) | 0), $m_ju_Arrays$().copyOfRange__AO__I__I__AO(preN1, 1, preN1.u.length))
      }
    }
  }
});
var $d_sci_VectorSliceBuilder = new $TypeData().initClass({
  sci_VectorSliceBuilder: 0
}, false, "scala.collection.immutable.VectorSliceBuilder", {
  sci_VectorSliceBuilder: 1,
  O: 1
});
$c_sci_VectorSliceBuilder.prototype.$classData = $d_sci_VectorSliceBuilder;
/** @constructor */
function $c_sci_VectorStatics$() {
  $c_O.call(this);
  this.empty1$1 = null;
  this.empty2$1 = null;
  this.empty3$1 = null;
  this.empty4$1 = null;
  this.empty5$1 = null;
  this.empty6$1 = null
}
$c_sci_VectorStatics$.prototype = new $h_O();
$c_sci_VectorStatics$.prototype.constructor = $c_sci_VectorStatics$;
/** @constructor */
function $h_sci_VectorStatics$() {
  /*<skip>*/
}
$h_sci_VectorStatics$.prototype = $c_sci_VectorStatics$.prototype;
$c_sci_VectorStatics$.prototype.init___ = (function() {
  $n_sci_VectorStatics$ = this;
  this.empty1$1 = $newArrayObject($d_O.getArrayOf(), [0]);
  this.empty2$1 = $newArrayObject($d_O.getArrayOf().getArrayOf(), [0]);
  this.empty3$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf(), [0]);
  this.empty4$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [0]);
  this.empty5$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [0]);
  this.empty6$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [0]);
  return this
});
$c_sci_VectorStatics$.prototype.foreachRec__I__AO__F1__V = (function(level, a, f) {
  var i = 0;
  var len = a.u.length;
  if ((level === 0)) {
    while ((i < len)) {
      f.apply__O__O(a.get(i));
      i = ((1 + i) | 0)
    }
  } else {
    var l = (((-1) + level) | 0);
    while ((i < len)) {
      this.foreachRec__I__AO__F1__V(l, $asArrayOf_O(a.get(i), 1), f);
      i = ((1 + i) | 0)
    }
  }
});
$c_sci_VectorStatics$.prototype.copyPrepend__O__AO__AO = (function(elem, a) {
  var ac = $asArrayOf_O($m_jl_reflect_Array$().newInstance__jl_Class__I__O($objectGetClass(a).getComponentType__jl_Class(), ((1 + a.u.length) | 0)), 1);
  $systemArraycopy(a, 0, ac, 1, a.u.length);
  ac.set(0, elem);
  return ac
});
$c_sci_VectorStatics$.prototype.copyPrepend1__O__AO__AO = (function(elem, a) {
  var ac = $newArrayObject($d_O.getArrayOf(), [((1 + a.u.length) | 0)]);
  $systemArraycopy(a, 0, ac, 1, a.u.length);
  ac.set(0, elem);
  return ac
});
var $d_sci_VectorStatics$ = new $TypeData().initClass({
  sci_VectorStatics$: 0
}, false, "scala.collection.immutable.VectorStatics$", {
  sci_VectorStatics$: 1,
  O: 1
});
$c_sci_VectorStatics$.prototype.$classData = $d_sci_VectorStatics$;
var $n_sci_VectorStatics$ = (void 0);
function $m_sci_VectorStatics$() {
  if ((!$n_sci_VectorStatics$)) {
    $n_sci_VectorStatics$ = new $c_sci_VectorStatics$().init___()
  };
  return $n_sci_VectorStatics$
}
function $f_scm_Growable__addAll__sc_IterableOnce__scm_Growable($thiz, xs) {
  var it = xs.iterator__sc_Iterator();
  while (it.hasNext__Z()) {
    $thiz.addOne__O__scm_Growable(it.next__O())
  };
  return $thiz
}
/** @constructor */
function $c_sjs_js_WrappedDictionary$Cache$() {
  $c_O.call(this);
  this.safeHasOwnProperty$1 = null
}
$c_sjs_js_WrappedDictionary$Cache$.prototype = new $h_O();
$c_sjs_js_WrappedDictionary$Cache$.prototype.constructor = $c_sjs_js_WrappedDictionary$Cache$;
/** @constructor */
function $h_sjs_js_WrappedDictionary$Cache$() {
  /*<skip>*/
}
$h_sjs_js_WrappedDictionary$Cache$.prototype = $c_sjs_js_WrappedDictionary$Cache$.prototype;
$c_sjs_js_WrappedDictionary$Cache$.prototype.init___ = (function() {
  $n_sjs_js_WrappedDictionary$Cache$ = this;
  this.safeHasOwnProperty$1 = $g.Object.prototype.hasOwnProperty;
  return this
});
var $d_sjs_js_WrappedDictionary$Cache$ = new $TypeData().initClass({
  sjs_js_WrappedDictionary$Cache$: 0
}, false, "scala.scalajs.js.WrappedDictionary$Cache$", {
  sjs_js_WrappedDictionary$Cache$: 1,
  O: 1
});
$c_sjs_js_WrappedDictionary$Cache$.prototype.$classData = $d_sjs_js_WrappedDictionary$Cache$;
var $n_sjs_js_WrappedDictionary$Cache$ = (void 0);
function $m_sjs_js_WrappedDictionary$Cache$() {
  if ((!$n_sjs_js_WrappedDictionary$Cache$)) {
    $n_sjs_js_WrappedDictionary$Cache$ = new $c_sjs_js_WrappedDictionary$Cache$().init___()
  };
  return $n_sjs_js_WrappedDictionary$Cache$
}
/** @constructor */
function $c_sjsr_Bits$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
}
$c_sjsr_Bits$.prototype = new $h_O();
$c_sjsr_Bits$.prototype.constructor = $c_sjsr_Bits$;
/** @constructor */
function $h_sjsr_Bits$() {
  /*<skip>*/
}
$h_sjsr_Bits$.prototype = $c_sjsr_Bits$.prototype;
$c_sjsr_Bits$.prototype.init___ = (function() {
  $n_sjsr_Bits$ = this;
  var x = ((($g.ArrayBuffer && $g.Int32Array) && $g.Float32Array) && $g.Float64Array);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = $uZ((!(!x)));
  this.arrayBuffer$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.ArrayBuffer(8) : null);
  this.int32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Int32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float64Array(this.arrayBuffer$1, 0, 1) : null);
  if ((!this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = ($uB(new $g.Int8Array(this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
$c_sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = $uI((value | 0));
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var t = this.doubleToLongBits__D__J(value);
    var lo = t.lo$2;
    var hi = t.hi$2;
    return (lo ^ hi)
  }
});
$c_sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = $uD($g.Math.pow(2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= $uD($g.Math.pow(2.0, (-1022))))) {
      var twoPowFbits = $uD($g.Math.pow(2.0, 52));
      var a = ($uD($g.Math.log(av)) / 0.6931471805599453);
      var x = $uD($g.Math.floor(a));
      var a$1 = $uI((x | 0));
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var twoPowE = $uD($g.Math.pow(2.0, b));
      if ((twoPowE > av)) {
        e = (((-1) + e) | 0);
        twoPowE = (twoPowE / 2)
      };
      var n = ((av / twoPowE) * twoPowFbits);
      var w = $uD($g.Math.floor(n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (w + 1) : (((w % 2) !== 0) ? (w + 1) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / $uD($g.Math.pow(2.0, (-1074))));
      var w$1 = $uD($g.Math.floor(n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (w$1 + 1) : (((w$1 % 2) !== 0) ? (w$1 + 1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = $uZ(x1_$_$$und1$1);
  var e$1 = $uI(x1_$_$$und2$1);
  var f$3 = $uD(x1_$_$$und3$1);
  var x$1 = (f$3 / 4.294967296E9);
  var hif = $uI((x$1 | 0));
  var hi = (((s$1 ? (-2147483648) : 0) | (e$1 << 20)) | hif);
  var lo = $uI((f$3 | 0));
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
});
$c_sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f) {
    this.float64Array$1[0] = value;
    var value$1 = $uI(this.int32Array$1[this.highOffset$1]);
    var value$2 = $uI(this.int32Array$1[this.lowOffset$1]);
    return new $c_sjsr_RuntimeLong().init___I__I(value$2, value$1)
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
var $d_sjsr_Bits$ = new $TypeData().initClass({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
$c_sjsr_Bits$.prototype.$classData = $d_sjsr_Bits$;
var $n_sjsr_Bits$ = (void 0);
function $m_sjsr_Bits$() {
  if ((!$n_sjsr_Bits$)) {
    $n_sjsr_Bits$ = new $c_sjsr_Bits$().init___()
  };
  return $n_sjsr_Bits$
}
/** @constructor */
function $c_sjsr_RuntimeString$() {
  $c_O.call(this);
  this.CASE$undINSENSITIVE$undORDER$1 = null;
  this.bitmap$0$1 = false
}
$c_sjsr_RuntimeString$.prototype = new $h_O();
$c_sjsr_RuntimeString$.prototype.constructor = $c_sjsr_RuntimeString$;
/** @constructor */
function $h_sjsr_RuntimeString$() {
  /*<skip>*/
}
$h_sjsr_RuntimeString$.prototype = $c_sjsr_RuntimeString$.prototype;
$c_sjsr_RuntimeString$.prototype.init___ = (function() {
  return this
});
$c_sjsr_RuntimeString$.prototype.getChars__T__I__I__AC__I__V = (function(thiz, srcBegin, srcEnd, dst, dstBegin) {
  if (((((srcEnd > $uI(thiz.length)) || (srcBegin < 0)) || (srcEnd < 0)) || (srcBegin > srcEnd))) {
    throw new $c_jl_StringIndexOutOfBoundsException().init___T("Index out of Bound")
  };
  var offset = ((dstBegin - srcBegin) | 0);
  var i = srcBegin;
  while ((i < srcEnd)) {
    var jsx$1 = i;
    var index = i;
    dst.set(((jsx$1 + offset) | 0), (65535 & $uI(thiz.charCodeAt(index))));
    i = ((1 + i) | 0)
  }
});
$c_sjsr_RuntimeString$.prototype.newString__AC__I__I__T = (function(value, offset, count) {
  var end = ((offset + count) | 0);
  if ((((offset < 0) || (end < offset)) || (end > value.u.length))) {
    throw new $c_jl_StringIndexOutOfBoundsException().init___()
  };
  var result = "";
  var i = offset;
  while ((i !== end)) {
    var jsx$1 = result;
    var c = value.get(i);
    result = (("" + jsx$1) + $as_T($g.String.fromCharCode(c)));
    i = ((1 + i) | 0)
  };
  return result
});
$c_sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + $uI(thiz.length)) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + $imul((65535 & $uI(thiz.charCodeAt(index))), mul)) | 0);
    mul = $imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
$c_sjsr_RuntimeString$.prototype.replaceAll__T__T__T__T = (function(thiz, regex, replacement) {
  if ((thiz === null)) {
    throw new $c_jl_NullPointerException().init___()
  };
  var this$1 = $m_ju_regex_Pattern$();
  var this$2 = this$1.compile__T__I__ju_regex_Pattern(regex, 0);
  return new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(this$2, thiz, 0, $uI(thiz.length)).replaceAll__T__T(replacement)
});
var $d_sjsr_RuntimeString$ = new $TypeData().initClass({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
$c_sjsr_RuntimeString$.prototype.$classData = $d_sjsr_RuntimeString$;
var $n_sjsr_RuntimeString$ = (void 0);
function $m_sjsr_RuntimeString$() {
  if ((!$n_sjsr_RuntimeString$)) {
    $n_sjsr_RuntimeString$ = new $c_sjsr_RuntimeString$().init___()
  };
  return $n_sjsr_RuntimeString$
}
/** @constructor */
function $c_sjsr_package$() {
  $c_O.call(this)
}
$c_sjsr_package$.prototype = new $h_O();
$c_sjsr_package$.prototype.constructor = $c_sjsr_package$;
/** @constructor */
function $h_sjsr_package$() {
  /*<skip>*/
}
$h_sjsr_package$.prototype = $c_sjsr_package$.prototype;
$c_sjsr_package$.prototype.init___ = (function() {
  return this
});
$c_sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if ((th instanceof $c_sjs_js_JavaScriptException)) {
    var x2 = $as_sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
$c_sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if ((e instanceof $c_jl_Throwable)) {
    var x2 = $as_jl_Throwable(e);
    return x2
  } else {
    return new $c_sjs_js_JavaScriptException().init___O(e)
  }
});
var $d_sjsr_package$ = new $TypeData().initClass({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
$c_sjsr_package$.prototype.$classData = $d_sjsr_package$;
var $n_sjsr_package$ = (void 0);
function $m_sjsr_package$() {
  if ((!$n_sjsr_package$)) {
    $n_sjsr_package$ = new $c_sjsr_package$().init___()
  };
  return $n_sjsr_package$
}
/** @constructor */
function $c_sr_BoxesRunTime$() {
  $c_O.call(this)
}
$c_sr_BoxesRunTime$.prototype = new $h_O();
$c_sr_BoxesRunTime$.prototype.constructor = $c_sr_BoxesRunTime$;
/** @constructor */
function $h_sr_BoxesRunTime$() {
  /*<skip>*/
}
$h_sr_BoxesRunTime$.prototype = $c_sr_BoxesRunTime$.prototype;
$c_sr_BoxesRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_BoxesRunTime$.prototype.equalsCharObject__jl_Character__O__Z = (function(xc, y) {
  if ((y instanceof $c_jl_Character)) {
    var x2 = $as_jl_Character(y);
    return (xc.value$1 === x2.value$1)
  } else if ($is_jl_Number(y)) {
    var x3 = $as_jl_Number(y);
    if (((typeof x3) === "number")) {
      var x2$1 = $uD(x3);
      return (x2$1 === xc.value$1)
    } else if ((x3 instanceof $c_sjsr_RuntimeLong)) {
      var t = $uJ(x3);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var value = xc.value$1;
      var hi$1 = (value >> 31);
      return ((lo === value) && (hi === hi$1))
    } else {
      return ((x3 === null) ? (xc === null) : $objectEquals(x3, xc))
    }
  } else {
    return ((xc === null) && (y === null))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumObject__jl_Number__O__Z = (function(xn, y) {
  if ($is_jl_Number(y)) {
    var x2 = $as_jl_Number(y);
    return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2)
  } else if ((y instanceof $c_jl_Character)) {
    var x3 = $as_jl_Character(y);
    if (((typeof xn) === "number")) {
      var x2$1 = $uD(xn);
      return (x2$1 === x3.value$1)
    } else if ((xn instanceof $c_sjsr_RuntimeLong)) {
      var t = $uJ(xn);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var value = x3.value$1;
      var hi$1 = (value >> 31);
      return ((lo === value) && (hi === hi$1))
    } else {
      return ((xn === null) ? (x3 === null) : $objectEquals(xn, x3))
    }
  } else {
    return ((xn === null) ? (y === null) : $objectEquals(xn, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equals__O__O__Z = (function(x, y) {
  if ((x === y)) {
    return true
  } else if ($is_jl_Number(x)) {
    var x2 = $as_jl_Number(x);
    return this.equalsNumObject__jl_Number__O__Z(x2, y)
  } else if ((x instanceof $c_jl_Character)) {
    var x3 = $as_jl_Character(x);
    return this.equalsCharObject__jl_Character__O__Z(x3, y)
  } else {
    return ((x === null) ? (y === null) : $objectEquals(x, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumNum__jl_Number__jl_Number__Z = (function(xn, yn) {
  if (((typeof xn) === "number")) {
    var x2 = $uD(xn);
    if (((typeof yn) === "number")) {
      var x2$2 = $uD(yn);
      return (x2 === x2$2)
    } else if ((yn instanceof $c_sjsr_RuntimeLong)) {
      var t = $uJ(yn);
      var lo = t.lo$2;
      var hi = t.hi$2;
      return (x2 === $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi))
    } else if ((yn instanceof $c_s_math_ScalaNumber)) {
      var x4 = $as_s_math_ScalaNumber(yn);
      return x4.equals__O__Z(x2)
    } else {
      return false
    }
  } else if ((xn instanceof $c_sjsr_RuntimeLong)) {
    var t$1 = $uJ(xn);
    var lo$1 = t$1.lo$2;
    var hi$1 = t$1.hi$2;
    if ((yn instanceof $c_sjsr_RuntimeLong)) {
      var t$2 = $uJ(yn);
      var lo$2 = t$2.lo$2;
      var hi$2 = t$2.hi$2;
      return ((lo$1 === lo$2) && (hi$1 === hi$2))
    } else if (((typeof yn) === "number")) {
      var x3$3 = $uD(yn);
      return ($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo$1, hi$1) === x3$3)
    } else if ((yn instanceof $c_s_math_ScalaNumber)) {
      var x4$2 = $as_s_math_ScalaNumber(yn);
      return x4$2.equals__O__Z(new $c_sjsr_RuntimeLong().init___I__I(lo$1, hi$1))
    } else {
      return false
    }
  } else {
    return ((xn === null) ? (yn === null) : $objectEquals(xn, yn))
  }
});
var $d_sr_BoxesRunTime$ = new $TypeData().initClass({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", {
  sr_BoxesRunTime$: 1,
  O: 1
});
$c_sr_BoxesRunTime$.prototype.$classData = $d_sr_BoxesRunTime$;
var $n_sr_BoxesRunTime$ = (void 0);
function $m_sr_BoxesRunTime$() {
  if ((!$n_sr_BoxesRunTime$)) {
    $n_sr_BoxesRunTime$ = new $c_sr_BoxesRunTime$().init___()
  };
  return $n_sr_BoxesRunTime$
}
var $d_sr_Null$ = new $TypeData().initClass({
  sr_Null$: 0
}, false, "scala.runtime.Null$", {
  sr_Null$: 1,
  O: 1
});
/** @constructor */
function $c_sr_ScalaRunTime$() {
  $c_O.call(this)
}
$c_sr_ScalaRunTime$.prototype = new $h_O();
$c_sr_ScalaRunTime$.prototype.constructor = $c_sr_ScalaRunTime$;
/** @constructor */
function $h_sr_ScalaRunTime$() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$.prototype = $c_sr_ScalaRunTime$.prototype;
$c_sr_ScalaRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_ScalaRunTime$.prototype.array$undlength__O__I = (function(xs) {
  return $m_jl_reflect_Array$().getLength__O__I(xs)
});
$c_sr_ScalaRunTime$.prototype.array$undupdate__O__I__O__V = (function(xs, idx, value) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    x2.set(idx, value)
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    x3.set(idx, $uI(value))
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    x4.set(idx, $uD(value))
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    x5.set(idx, $uJ(value))
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    x6.set(idx, $uF(value))
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    if ((value === null)) {
      var jsx$1 = 0
    } else {
      var this$2 = $as_jl_Character(value);
      var jsx$1 = this$2.value$1
    };
    x7.set(idx, jsx$1)
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    x8.set(idx, $uB(value))
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    x9.set(idx, $uS(value))
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    x10.set(idx, $uZ(value))
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    x11.set(idx, (void 0))
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.$$undtoString__s_Product__T = (function(x) {
  var this$1 = x.productIterator__sc_Iterator();
  var start = (x.productPrefix__T() + "(");
  return $f_sc_IterableOnceOps__mkString__T__T__T__T(this$1, start, ",", ")")
});
$c_sr_ScalaRunTime$.prototype.array$undapply__O__I__O = (function(xs, idx) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.get(idx)
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.get(idx)
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.get(idx)
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.get(idx)
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.get(idx)
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    var c = x7.get(idx);
    return new $c_jl_Character().init___C(c)
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.get(idx)
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.get(idx)
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.get(idx)
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.get(idx)
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
var $d_sr_ScalaRunTime$ = new $TypeData().initClass({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
$c_sr_ScalaRunTime$.prototype.$classData = $d_sr_ScalaRunTime$;
var $n_sr_ScalaRunTime$ = (void 0);
function $m_sr_ScalaRunTime$() {
  if ((!$n_sr_ScalaRunTime$)) {
    $n_sr_ScalaRunTime$ = new $c_sr_ScalaRunTime$().init___()
  };
  return $n_sr_ScalaRunTime$
}
/** @constructor */
function $c_sr_Statics$() {
  $c_O.call(this)
}
$c_sr_Statics$.prototype = new $h_O();
$c_sr_Statics$.prototype.constructor = $c_sr_Statics$;
/** @constructor */
function $h_sr_Statics$() {
  /*<skip>*/
}
$h_sr_Statics$.prototype = $c_sr_Statics$.prototype;
$c_sr_Statics$.prototype.init___ = (function() {
  return this
});
$c_sr_Statics$.prototype.doubleHash__D__I = (function(dv) {
  var iv = $doubleToInt(dv);
  if ((iv === dv)) {
    return iv
  } else {
    var this$1 = $m_sjsr_RuntimeLong$();
    var lo = this$1.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(dv);
    var hi = this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
    return (($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi) === dv) ? (lo ^ hi) : $m_sjsr_Bits$().numberHashCode__D__I(dv))
  }
});
$c_sr_Statics$.prototype.anyHash__O__I = (function(x) {
  if ((x === null)) {
    return 0
  } else if (((typeof x) === "number")) {
    var x3 = $uD(x);
    return this.doubleHash__D__I(x3)
  } else if ((x instanceof $c_sjsr_RuntimeLong)) {
    var t = $uJ(x);
    var lo = t.lo$2;
    var hi = t.hi$2;
    return this.longHash__J__I(new $c_sjsr_RuntimeLong().init___I__I(lo, hi))
  } else {
    return $objectHashCode(x)
  }
});
$c_sr_Statics$.prototype.ioobe__I__O = (function(n) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
});
$c_sr_Statics$.prototype.longHash__J__I = (function(lv) {
  var lo = lv.lo$2;
  var lo$1 = lv.hi$2;
  return ((lo$1 === (lo >> 31)) ? lo : (lo ^ lo$1))
});
var $d_sr_Statics$ = new $TypeData().initClass({
  sr_Statics$: 0
}, false, "scala.runtime.Statics$", {
  sr_Statics$: 1,
  O: 1
});
$c_sr_Statics$.prototype.$classData = $d_sr_Statics$;
var $n_sr_Statics$ = (void 0);
function $m_sr_Statics$() {
  if ((!$n_sr_Statics$)) {
    $n_sr_Statics$ = new $c_sr_Statics$().init___()
  };
  return $n_sr_Statics$
}
/** @constructor */
function $c_sr_Statics$PFMarker$() {
  $c_O.call(this)
}
$c_sr_Statics$PFMarker$.prototype = new $h_O();
$c_sr_Statics$PFMarker$.prototype.constructor = $c_sr_Statics$PFMarker$;
/** @constructor */
function $h_sr_Statics$PFMarker$() {
  /*<skip>*/
}
$h_sr_Statics$PFMarker$.prototype = $c_sr_Statics$PFMarker$.prototype;
$c_sr_Statics$PFMarker$.prototype.init___ = (function() {
  return this
});
var $d_sr_Statics$PFMarker$ = new $TypeData().initClass({
  sr_Statics$PFMarker$: 0
}, false, "scala.runtime.Statics$PFMarker$", {
  sr_Statics$PFMarker$: 1,
  O: 1
});
$c_sr_Statics$PFMarker$.prototype.$classData = $d_sr_Statics$PFMarker$;
var $n_sr_Statics$PFMarker$ = (void 0);
function $m_sr_Statics$PFMarker$() {
  if ((!$n_sr_Statics$PFMarker$)) {
    $n_sr_Statics$PFMarker$ = new $c_sr_Statics$PFMarker$().init___()
  };
  return $n_sr_Statics$PFMarker$
}
/** @constructor */
function $c_LMyTalk$() {
  $c_O.call(this);
  this.chapter1$1 = null;
  this.chapter2$1 = null;
  this.Talk$1 = null
}
$c_LMyTalk$.prototype = new $h_O();
$c_LMyTalk$.prototype.constructor = $c_LMyTalk$;
/** @constructor */
function $h_LMyTalk$() {
  /*<skip>*/
}
$h_LMyTalk$.prototype = $c_LMyTalk$.prototype;
$c_LMyTalk$.prototype.init___ = (function() {
  $n_LMyTalk$ = this;
  var jsx$25 = $m_Lshared_PresentationUtil$();
  var jsx$24 = $m_Lshared_PresentationUtil$();
  var jsx$23 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar("Build your presentations with ScalaJS + reveal.js"))];
  var jsx$22 = jsx$23.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("h2", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array));
  var this$8 = $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().$$less$3;
  var t = $f_Ljapgolly_scalajs_react_vdom_HtmlTags__br__T(this$8);
  var jsx$21 = new $c_Ljapgolly_scalajs_react_vdom_TagOf().init___T__sci_List__T(t, $m_sci_Nil$(), $m_Ljapgolly_scalajs_react_vdom_Namespace$().Html$1);
  var jsx$20 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array$1 = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar("move down (down-arrow)"))];
  var array$2 = [jsx$22, jsx$21, jsx$20.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("h4", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$1))];
  var jsx$19 = jsx$24.chapterSlide__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$2));
  var jsx$18 = $m_Lshared_PresentationUtil$();
  var jsx$17 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array$3 = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar("Press 'f' to go full-screen and ESC to see an overview of your slides."))];
  var jsx$16 = jsx$17.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("p", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$3));
  var this$27 = $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().$$less$3;
  var t$1 = $f_Ljapgolly_scalajs_react_vdom_HtmlTags__br__T(this$27);
  var jsx$15 = new $c_Ljapgolly_scalajs_react_vdom_TagOf().init___T__sci_List__T(t$1, $m_sci_Nil$(), $m_Ljapgolly_scalajs_react_vdom_Namespace$().Html$1);
  var jsx$14 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array$4 = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar("You can navigate to the right and down."))];
  var array$5 = [jsx$16, jsx$15, jsx$14.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("p", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$4))];
  var jsx$13 = jsx$18.headerSlide__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("reveal.js commands", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$5));
  var jsx$12 = $m_Lshared_PresentationUtil$();
  var jsx$11 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array$6 = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar("Headers everywhere"))];
  var array$7 = [jsx$11.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("h3", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$6))];
  var jsx$10 = jsx$12.headerSlide__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("My Header", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$7));
  var jsx$9 = $m_Lshared_PresentationUtil$();
  var jsx$8 = $m_Lshared_PresentationUtil$Enumeration$();
  var jsx$7 = $m_Lshared_PresentationUtil$Enumeration$Item$().stable__T__Ljapgolly_scalajs_react_vdom_TagOf("always show this item");
  var array$8 = [$m_Lshared_PresentationUtil$Enumeration$Item$().fadeIn__T__Ljapgolly_scalajs_react_vdom_TagOf("I fade in"), $m_Lshared_PresentationUtil$Enumeration$Item$().stable__T__Ljapgolly_scalajs_react_vdom_TagOf("I am also always here")];
  var array$9 = [jsx$8.apply__Ljapgolly_scalajs_react_vdom_TagOf__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf(jsx$7, new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$8))];
  var jsx$6 = jsx$9.headerSlide__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("Enumeration", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$9));
  var jsx$5 = $m_Lshared_PresentationUtil$();
  var jsx$4 = $m_Lshared_PresentationUtil$().scalaC__T__Ljapgolly_scalajs_react_vdom_TagOf("\n        def main(args: Array[String]): Unit = {\n          println(\"hello, world\")\n        }\n      ");
  var this$55 = $m_Lshared_PresentationUtil$();
  var array$10 = [jsx$4, this$55.rawCodeFragment__p1__T__T__Ljapgolly_scalajs_react_vdom_TagOf("Scala", "\n        def moreSideEffects(): Unit = {\n          println(\"pop in\")\n        }\n      ")];
  var jsx$3 = jsx$5.headerSlide__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("Code, so much code", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$10));
  var jsx$2 = $m_Lshared_PresentationUtil$();
  var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array$11 = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar("Or have a blank slide"))];
  var array$12 = [jsx$1.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("h3", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$11))];
  var array$13 = [jsx$19, jsx$13, jsx$10, jsx$6, jsx$3, jsx$2.noHeaderSlide__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$12))];
  this.chapter1$1 = jsx$25.chapter__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$13));
  var jsx$34 = $m_Lshared_PresentationUtil$();
  var jsx$33 = $m_Lshared_PresentationUtil$();
  var jsx$32 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array$14 = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar("Where can I find more information?"))];
  var array$15 = [jsx$32.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("h2", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$14))];
  var jsx$31 = jsx$33.chapterSlide__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$15));
  var jsx$30 = $m_Lshared_PresentationUtil$();
  var jsx$29 = $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().$$less$3.a__Ljapgolly_scalajs_react_vdom_HtmlTags$a$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_PackageBase$();
  var this$84 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("href");
  var t$2 = $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2;
  var array$16 = [$m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod(t$2, this$84.attrName$1, "https://github.com/hakimel/reveal.js/"), ($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar("reveal.js"))];
  var array$17 = [jsx$29.apply__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$16))];
  var jsx$28 = jsx$30.headerSlide__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("about reveal.js", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$17));
  var jsx$27 = $m_Lshared_PresentationUtil$();
  var jsx$26 = $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().$$less$3.a__Ljapgolly_scalajs_react_vdom_HtmlTags$a$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_PackageBase$();
  var this$95 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("href");
  var t$3 = $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2;
  var array$18 = [$m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod(t$3, this$95.attrName$1, "https://www.scala-js.org"), ($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_VdomNode$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1().init___sjs_js_$bar("ScalaJS"))];
  var array$19 = [jsx$26.apply__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$18))];
  var array$20 = [jsx$31, jsx$28, jsx$27.headerSlide__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("about ScalaJS", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$19))];
  this.chapter2$1 = jsx$34.chapter__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$20));
  $m_Ljapgolly_scalajs_react_component_builder_Builder$();
  $m_Ljapgolly_scalajs_react_package$();
  var b = new $c_Ljapgolly_scalajs_react_component_builder_Builder$Step1().init___T("Presentation");
  var jsx$38 = ($m_Ljapgolly_scalajs_react_component_builder_Builder$(), b.stateless__Ljapgolly_scalajs_react_component_builder_Builder$Step2()).noBackend__Ljapgolly_scalajs_react_component_builder_Builder$Step3();
  var jsx$37 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var jsx$36 = ($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("reveal", $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2);
  var jsx$35 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_Exports$();
  var array$21 = [($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("slides", $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2), this.chapter1$1, this.chapter2$1];
  var array$22 = [jsx$36, jsx$35.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("div", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$21))];
  var stabilizer$1 = jsx$38.renderStatic__Ljapgolly_scalajs_react_vdom_VdomNode__Ljapgolly_scalajs_react_component_builder_Builder$Step4(jsx$37.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf("div", new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(array$22)));
  this.Talk$1 = stabilizer$1.build__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_internal_JsRepr__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot($m_Ljapgolly_scalajs_react_CtorType$Summoner$().summonN__Ljapgolly_scalajs_react_internal_Singleton__Ljapgolly_scalajs_react_CtorType$Summoner($m_Ljapgolly_scalajs_react_internal_Singleton$().BoxUnit$1), $m_Ljapgolly_scalajs_react_internal_JsRepr$().unit$1);
  return this
});
$c_LMyTalk$.prototype.main__V = (function() {
  var c = this.Talk$1;
  var qual$1 = $as_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot($as_Ljapgolly_scalajs_react_CtorType$Nullary(c.ctor__Ljapgolly_scalajs_react_CtorType()).apply__O());
  var a = $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().body;
  var x$2 = $m_Ljapgolly_scalajs_react_Callback$().empty$1;
  $f_Ljapgolly_scalajs_react_component_Generic$UnmountedSimple__renderIntoDOM__sjs_js_$bar__F0__O(qual$1, a, x$2)
});
$c_LMyTalk$.prototype.$$js$exported$meth$main__O = (function() {
  this.main__V()
});
$c_LMyTalk$.prototype.main = (function() {
  return this.$$js$exported$meth$main__O()
});
var $d_LMyTalk$ = new $TypeData().initClass({
  LMyTalk$: 0
}, false, "MyTalk$", {
  LMyTalk$: 1,
  O: 1,
  sjs_js_JSApp: 1
});
$c_LMyTalk$.prototype.$classData = $d_LMyTalk$;
var $n_LMyTalk$ = (void 0);
function $m_LMyTalk$() {
  if ((!$n_LMyTalk$)) {
    $n_LMyTalk$ = new $c_LMyTalk$().init___()
  };
  return $n_LMyTalk$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$Nullary() {
  $c_Ljapgolly_scalajs_react_CtorType.call(this);
  this.unmodified$2 = null;
  this.construct$2 = null;
  this.mods$2 = null
}
$c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype = new $h_Ljapgolly_scalajs_react_CtorType();
$c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$Nullary;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$Nullary() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$Nullary.prototype = $c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype;
$c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype.init___O__F1__sjs_js_UndefOr = (function(unmodified, construct, mods) {
  this.unmodified$2 = unmodified;
  this.construct$2 = construct;
  this.mods$2 = mods;
  return this
});
$c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype.apply__O = (function() {
  var value = this.mods$2;
  var f = this.construct$2;
  return ((value === (void 0)) ? this.unmodified$2 : f.apply__O__O(value))
});
function $as_Ljapgolly_scalajs_react_CtorType$Nullary(obj) {
  return (((obj instanceof $c_Ljapgolly_scalajs_react_CtorType$Nullary) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.CtorType$Nullary"))
}
function $isArrayOf_Ljapgolly_scalajs_react_CtorType$Nullary(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_CtorType$Nullary)))
}
function $asArrayOf_Ljapgolly_scalajs_react_CtorType$Nullary(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_CtorType$Nullary(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.CtorType$Nullary;", depth))
}
var $d_Ljapgolly_scalajs_react_CtorType$Nullary = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$Nullary: 0
}, false, "japgolly.scalajs.react.CtorType$Nullary", {
  Ljapgolly_scalajs_react_CtorType$Nullary: 1,
  Ljapgolly_scalajs_react_CtorType: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$Nullary;
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$ProfunctorN$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype = $c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype;
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype.rmap__Ljapgolly_scalajs_react_CtorType$Nullary__F1__Ljapgolly_scalajs_react_CtorType$Nullary = (function(x, g) {
  return new $c_Ljapgolly_scalajs_react_CtorType$Nullary().init___O__F1__sjs_js_UndefOr(g.apply__O__O(x.unmodified$2), g.compose__F1__F1(x.construct$2), x.mods$2)
});
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype.dimap__Ljapgolly_scalajs_react_CtorType$Nullary__F1__F1__Ljapgolly_scalajs_react_CtorType$Nullary = (function(x, f, g) {
  return new $c_Ljapgolly_scalajs_react_CtorType$Nullary().init___O__F1__sjs_js_UndefOr(g.apply__O__O(x.unmodified$2), g.compose__F1__F1(x.construct$2), x.mods$2)
});
var $d_Ljapgolly_scalajs_react_CtorType$ProfunctorN$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$ProfunctorN$: 0
}, false, "japgolly.scalajs.react.CtorType$ProfunctorN$", {
  Ljapgolly_scalajs_react_CtorType$ProfunctorN$: 1,
  O: 1,
  Ljapgolly_scalajs_react_internal_Profunctor: 1
});
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$ProfunctorN$;
var $n_Ljapgolly_scalajs_react_CtorType$ProfunctorN$ = (void 0);
function $m_Ljapgolly_scalajs_react_CtorType$ProfunctorN$() {
  if ((!$n_Ljapgolly_scalajs_react_CtorType$ProfunctorN$)) {
    $n_Ljapgolly_scalajs_react_CtorType$ProfunctorN$ = new $c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$().init___()
  };
  return $n_Ljapgolly_scalajs_react_CtorType$ProfunctorN$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1() {
  $c_O.call(this);
  this.summon$1 = null;
  this.pf$1 = null
}
$c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype = $c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype.init___F1__Ljapgolly_scalajs_react_internal_Profunctor = (function(f$7, p$3) {
  this.summon$1 = f$7;
  this.pf$1 = p$3;
  return this
});
var $d_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1: 0
}, false, "japgolly.scalajs.react.CtorType$Summoner$$anon$1", {
  Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1: 1,
  O: 1,
  Ljapgolly_scalajs_react_CtorType$Summoner: 1
});
$c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Js$() {
  $c_O.call(this);
  this.rawComponentDisplayName$1 = null
}
$c_Ljapgolly_scalajs_react_component_Js$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Js$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Js$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Js$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Js$.prototype = $c_Ljapgolly_scalajs_react_component_Js$.prototype;
$c_Ljapgolly_scalajs_react_component_Js$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_component_Js$ = this;
  this.rawComponentDisplayName$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(a$2) {
      return $m_Ljapgolly_scalajs_react_component_Js$().japgolly$scalajs$react$component$Js$$readDisplayName__Ljapgolly_scalajs_react_raw_package$HasDisplayName__T(a$2)
    })
  })(this));
  return this
});
$c_Ljapgolly_scalajs_react_component_Js$.prototype.japgolly$scalajs$react$component$Js$$readDisplayName__Ljapgolly_scalajs_react_raw_package$HasDisplayName__T = (function(a) {
  var value = a.displayName;
  return $as_T(((value === (void 0)) ? "" : value))
});
$c_Ljapgolly_scalajs_react_component_Js$.prototype.component__sjs_js_Function1__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(rc, s) {
  var this$5 = s.pf$1;
  var f = s.summon$1.apply__O__O(rc);
  var m = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(r$2) {
      return $m_Ljapgolly_scalajs_react_component_Js$().unmounted__Ljapgolly_scalajs_react_raw_React$ComponentElement__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(r$2)
    })
  })(this));
  var c = this$5.rmap__Ljapgolly_scalajs_react_CtorType$Nullary__F1__Ljapgolly_scalajs_react_CtorType$Nullary($as_Ljapgolly_scalajs_react_CtorType$Nullary(f), m);
  var pf = s.pf$1;
  return new $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1().init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__sjs_js_Any__Ljapgolly_scalajs_react_CtorType__Ljapgolly_scalajs_react_internal_Profunctor(this, rc, c, pf)
});
$c_Ljapgolly_scalajs_react_component_Js$.prototype.unmounted__Ljapgolly_scalajs_react_raw_React$ComponentElement__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function(r) {
  var m = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(r$2$2) {
      $m_Ljapgolly_scalajs_react_component_Js$();
      return new $c_Ljapgolly_scalajs_react_component_Js$$anon$3().init___Ljapgolly_scalajs_react_raw_React$Component(r$2$2)
    })
  })(this));
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$1().init___Ljapgolly_scalajs_react_raw_React$ComponentElement__F1(r, m)
});
var $d_Ljapgolly_scalajs_react_component_Js$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Js$: 0
}, false, "japgolly.scalajs.react.component.Js$", {
  Ljapgolly_scalajs_react_component_Js$: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate: 1
});
$c_Ljapgolly_scalajs_react_component_Js$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Js$;
var $n_Ljapgolly_scalajs_react_component_Js$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_Js$() {
  if ((!$n_Ljapgolly_scalajs_react_component_Js$)) {
    $n_Ljapgolly_scalajs_react_component_Js$ = new $c_Ljapgolly_scalajs_react_component_Js$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_Js$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_JsFn$() {
  $c_O.call(this);
  this.japgolly$scalajs$react$component$JsFn$$constUnit$1 = null
}
$c_Ljapgolly_scalajs_react_component_JsFn$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_JsFn$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_JsFn$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_JsFn$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_JsFn$.prototype = $c_Ljapgolly_scalajs_react_component_JsFn$.prototype;
$c_Ljapgolly_scalajs_react_component_JsFn$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_component_JsFn$ = this;
  this.japgolly$scalajs$react$component$JsFn$$constUnit$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$6$2) {
      return (void 0)
    })
  })(this));
  return this
});
var $d_Ljapgolly_scalajs_react_component_JsFn$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_JsFn$: 0
}, false, "japgolly.scalajs.react.component.JsFn$", {
  Ljapgolly_scalajs_react_component_JsFn$: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate: 1
});
$c_Ljapgolly_scalajs_react_component_JsFn$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_JsFn$;
var $n_Ljapgolly_scalajs_react_component_JsFn$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_JsFn$() {
  if ((!$n_Ljapgolly_scalajs_react_component_JsFn$)) {
    $n_Ljapgolly_scalajs_react_component_JsFn$ = new $c_Ljapgolly_scalajs_react_component_JsFn$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_JsFn$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$.prototype.japgolly$scalajs$react$component$builder$Lifecycle$$wrapTostring__T__T = (function(toString) {
  var thiz = $m_sjsr_RuntimeString$().replaceAll__T__T__T__T(toString, "undefined \u2192 undefined", "undefined");
  var thiz$1 = $as_T(thiz.split("props: undefined, ").join(""));
  var thiz$2 = $as_T(thiz$1.split("state: undefined)").join(")"));
  return $as_T(thiz$2.split(", )").join(")"))
});
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$;
var $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$() {
  if ((!$n_Ljapgolly_scalajs_react_component_builder_Lifecycle$)) {
    $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$ = new $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_builder_Lifecycle$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount() {
  $c_O.call(this);
  this.raw$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount.prototype.equals__O__Z = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$().equals$extension__Ljapgolly_scalajs_react_raw_React$Component__O__Z(this.raw$1, x$1)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount$().toString$extension__Ljapgolly_scalajs_react_raw_React$Component__T(this.raw$1)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount.prototype.init___Ljapgolly_scalajs_react_raw_React$Component = (function(raw) {
  this.raw$1 = raw;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount.prototype.hashCode__I = (function() {
  var $$this = this.raw$1;
  return $objectHashCode($$this)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$1
});
function $as_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount(obj) {
  return (((obj instanceof $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentWillUnmount"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.builder.Lifecycle$ComponentWillUnmount;", depth))
}
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentWillUnmount", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$Base: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUnmount;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate() {
  $c_O.call(this);
  this.raw$1 = null;
  this.nextProps$1 = null;
  this.nextState$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$().japgolly$scalajs$react$component$builder$Lifecycle$$wrapTostring__T__T((((((((("ComponentWillUpdate(props: " + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).props__O()) + " \u2192 ") + this.nextProps$1) + ", state: ") + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).state__O()) + " \u2192 ") + this.nextState$1) + ")"))
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate.prototype.init___Ljapgolly_scalajs_react_raw_React$Component__O__O = (function(raw, nextProps, nextState) {
  this.raw$1 = raw;
  this.nextProps$1 = nextProps;
  this.nextState$1 = nextState;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$1
});
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentWillUpdate", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$Base: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillUpdate;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate() {
  $c_O.call(this);
  this.raw$1 = null;
  this.prevProps$1 = null;
  this.prevState$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$().japgolly$scalajs$react$component$builder$Lifecycle$$wrapTostring__T__T((((((((("GetSnapshotBeforeUpdate(props: " + this.prevProps$1) + " \u2192 ") + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).props__O()) + ", state: ") + this.prevState$1) + " \u2192 ") + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).state__O()) + ")"))
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate.prototype.init___Ljapgolly_scalajs_react_raw_React$Component__O__O = (function(raw, prevProps, prevState) {
  this.raw$1 = raw;
  this.prevProps$1 = prevProps;
  this.prevState$1 = prevState;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$1
});
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$GetSnapshotBeforeUpdate", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$Base: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$GetSnapshotBeforeUpdate;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate() {
  $c_O.call(this);
  this.raw$1 = null;
  this.nextProps$1 = null;
  this.nextState$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$().japgolly$scalajs$react$component$builder$Lifecycle$$wrapTostring__T__T((((((((("ShouldComponentUpdate(props: " + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).props__O()) + " \u2192 ") + this.nextProps$1) + ", state: ") + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).state__O()) + " \u2192 ") + this.nextState$1) + ")"))
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate.prototype.init___Ljapgolly_scalajs_react_raw_React$Component__O__O = (function(raw, nextProps, nextState) {
  this.raw$1 = raw;
  this.nextProps$1 = nextProps;
  this.nextState$1 = nextState;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$1
});
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$ShouldComponentUpdate", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$Base: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ShouldComponentUpdate;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$$anon$1() {
  $c_Ljapgolly_scalajs_react_internal_Effect.call(this)
}
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype = new $h_Ljapgolly_scalajs_react_internal_Effect();
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype.extract__F0__F0 = (function(a) {
  return a
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype.point__F0__O = (function(a) {
  return a.apply__O()
});
var $d_Ljapgolly_scalajs_react_internal_Effect$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$$anon$1: 0
}, false, "japgolly.scalajs.react.internal.Effect$$anon$1", {
  Ljapgolly_scalajs_react_internal_Effect$$anon$1: 1,
  Ljapgolly_scalajs_react_internal_Effect: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$$anon$2() {
  $c_Ljapgolly_scalajs_react_internal_Effect.call(this)
}
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype = new $h_Ljapgolly_scalajs_react_internal_Effect();
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$$anon$2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$$anon$2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype.extract__F0__F0 = (function(a) {
  var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(a.apply__O()).japgolly$scalajs$react$CallbackTo$$f$1;
  return $$this
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype.point__F0__O = (function(a) {
  return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0(a)
});
var $d_Ljapgolly_scalajs_react_internal_Effect$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$$anon$2: 0
}, false, "japgolly.scalajs.react.internal.Effect$$anon$2", {
  Ljapgolly_scalajs_react_internal_Effect$$anon$2: 1,
  Ljapgolly_scalajs_react_internal_Effect: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$$anon$2;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id() {
  $c_Ljapgolly_scalajs_react_internal_Effect$Trans.call(this)
}
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype = new $h_Ljapgolly_scalajs_react_internal_Effect$Trans();
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$Trans$Id() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype.apply__F0__O = (function(f) {
  return f.apply__O()
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype.init___Ljapgolly_scalajs_react_internal_Effect = (function(F) {
  $c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.init___Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect.call(this, F, F);
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Effect$Trans$Id = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$Trans$Id: 0
}, false, "japgolly.scalajs.react.internal.Effect$Trans$Id", {
  Ljapgolly_scalajs_react_internal_Effect$Trans$Id: 1,
  Ljapgolly_scalajs_react_internal_Effect$Trans: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$Trans$Id;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1() {
  $c_O.call(this);
  this.fromJs$1 = null;
  this.toJs$1 = null
}
$c_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1.prototype = $c_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1.prototype.init___F1__F1 = (function(_fromJs$1, _toJs$1) {
  this.fromJs$1 = _fromJs$1;
  this.toJs$1 = _toJs$1;
  return this
});
var $d_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_JsRepr$$anon$1: 0
}, false, "japgolly.scalajs.react.internal.JsRepr$$anon$1", {
  Ljapgolly_scalajs_react_internal_JsRepr$$anon$1: 1,
  O: 1,
  Ljapgolly_scalajs_react_internal_JsRepr: 1
});
$c_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1;
function $f_Ljapgolly_scalajs_react_internal_JsReprHighPri__$$init$__V($thiz) {
  $thiz.unit$1 = $m_Ljapgolly_scalajs_react_internal_JsRepr$().id__F1__Ljapgolly_scalajs_react_internal_JsRepr(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(value$2) {
      var value = $asUnit(value$2);
      return value
    })
  })($thiz)))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_package$() {
  $c_O.call(this);
  this.GenericComponent$1 = null;
  this.JsComponent$1 = null;
  this.JsFnComponent$1 = null;
  this.JsForwardRefComponent$1 = null;
  this.ScalaComponent$1 = null;
  this.ScalaFnComponent$1 = null;
  this.ScalaForwardRefComponent$1 = null
}
$c_Ljapgolly_scalajs_react_package$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_package$.prototype.constructor = $c_Ljapgolly_scalajs_react_package$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_package$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_package$.prototype = $c_Ljapgolly_scalajs_react_package$.prototype;
$c_Ljapgolly_scalajs_react_package$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_package$ = this;
  this.GenericComponent$1 = $m_Ljapgolly_scalajs_react_component_Generic$();
  this.JsComponent$1 = $m_Ljapgolly_scalajs_react_component_Js$();
  this.JsFnComponent$1 = $m_Ljapgolly_scalajs_react_component_JsFn$();
  this.JsForwardRefComponent$1 = $m_Ljapgolly_scalajs_react_component_JsForwardRef$();
  this.ScalaComponent$1 = $m_Ljapgolly_scalajs_react_component_Scala$();
  this.ScalaFnComponent$1 = $m_Ljapgolly_scalajs_react_component_ScalaFn$();
  this.ScalaForwardRefComponent$1 = $m_Ljapgolly_scalajs_react_component_ScalaForwardRef$();
  return this
});
var $d_Ljapgolly_scalajs_react_package$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_package$: 0
}, false, "japgolly.scalajs.react.package$", {
  Ljapgolly_scalajs_react_package$: 1,
  O: 1,
  Ljapgolly_scalajs_react_ReactEventTypes: 1
});
$c_Ljapgolly_scalajs_react_package$.prototype.$classData = $d_Ljapgolly_scalajs_react_package$;
var $n_Ljapgolly_scalajs_react_package$ = (void 0);
function $m_Ljapgolly_scalajs_react_package$() {
  if ((!$n_Ljapgolly_scalajs_react_package$)) {
    $n_Ljapgolly_scalajs_react_package$ = new $c_Ljapgolly_scalajs_react_package$().init___()
  };
  return $n_Ljapgolly_scalajs_react_package$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$() {
  $c_Ljapgolly_scalajs_react_vdom_Attr.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype = new $h_Ljapgolly_scalajs_react_vdom_Attr();
$c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr$ClassName$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype.init___ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Attr.prototype.init___T.call(this, "class");
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype.$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod = (function(a, t) {
  $m_Ljapgolly_scalajs_react_vdom_TagMod$();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, t$1, a$1) {
    return (function(b$2) {
      var b = $as_Ljapgolly_scalajs_react_vdom_Builder(b$2);
      t$1.apply__O__O__O(b.addClassName$1, a$1)
    })
  })(this, t, a));
  return new $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3().init___F1(f)
});
var $d_Ljapgolly_scalajs_react_vdom_Attr$ClassName$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr$ClassName$: 0
}, false, "japgolly.scalajs.react.vdom.Attr$ClassName$", {
  Ljapgolly_scalajs_react_vdom_Attr$ClassName$: 1,
  Ljapgolly_scalajs_react_vdom_Attr: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr$ClassName$;
var $n_Ljapgolly_scalajs_react_vdom_Attr$ClassName$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Attr$ClassName$)) {
    $n_Ljapgolly_scalajs_react_vdom_Attr$ClassName$ = new $c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Attr$ClassName$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr$Generic() {
  $c_Ljapgolly_scalajs_react_vdom_Attr.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype = new $h_Ljapgolly_scalajs_react_vdom_Attr();
$c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr$Generic;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr$Generic() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype.$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod = (function(a, t) {
  return $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod(t, this.attrName$1, a)
});
$c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype.init___T = (function(attrName) {
  $c_Ljapgolly_scalajs_react_vdom_Attr.prototype.init___T.call(this, attrName);
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Attr$Generic = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr$Generic: 0
}, false, "japgolly.scalajs.react.vdom.Attr$Generic", {
  Ljapgolly_scalajs_react_vdom_Attr$Generic: 1,
  Ljapgolly_scalajs_react_vdom_Attr: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr$Generic;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr$Key$() {
  $c_Ljapgolly_scalajs_react_vdom_Attr.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Attr$Key$.prototype = new $h_Ljapgolly_scalajs_react_vdom_Attr();
$c_Ljapgolly_scalajs_react_vdom_Attr$Key$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr$Key$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr$Key$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr$Key$.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr$Key$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr$Key$.prototype.init___ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Attr.prototype.init___T.call(this, "key");
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Attr$Key$.prototype.$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod = (function(a, t) {
  $m_Ljapgolly_scalajs_react_vdom_TagMod$();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, t$1, a$1) {
    return (function(b$2) {
      var b = $as_Ljapgolly_scalajs_react_vdom_Builder(b$2);
      t$1.apply__O__O__O(b.setKey$1, a$1)
    })
  })(this, t, a));
  return new $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3().init___F1(f)
});
var $d_Ljapgolly_scalajs_react_vdom_Attr$Key$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr$Key$: 0
}, false, "japgolly.scalajs.react.vdom.Attr$Key$", {
  Ljapgolly_scalajs_react_vdom_Attr$Key$: 1,
  Ljapgolly_scalajs_react_vdom_Attr: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr$Key$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr$Key$;
var $n_Ljapgolly_scalajs_react_vdom_Attr$Key$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Attr$Key$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Attr$Key$)) {
    $n_Ljapgolly_scalajs_react_vdom_Attr$Key$ = new $c_Ljapgolly_scalajs_react_vdom_Attr$Key$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Attr$Key$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Exports$() {
  $c_Ljapgolly_scalajs_react_vdom_Exports.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Exports$.prototype = new $h_Ljapgolly_scalajs_react_vdom_Exports();
$c_Ljapgolly_scalajs_react_vdom_Exports$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Exports$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Exports$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Exports$.prototype = $c_Ljapgolly_scalajs_react_vdom_Exports$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Exports$.prototype.init___ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Exports.prototype.init___.call(this);
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Exports$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Exports$: 0
}, false, "japgolly.scalajs.react.vdom.Exports$", {
  Ljapgolly_scalajs_react_vdom_Exports$: 1,
  Ljapgolly_scalajs_react_vdom_Exports: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Exports$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Exports$;
var $n_Ljapgolly_scalajs_react_vdom_Exports$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Exports$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Exports$)) {
    $n_Ljapgolly_scalajs_react_vdom_Exports$ = new $c_Ljapgolly_scalajs_react_vdom_Exports$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Exports$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_HtmlTagOf$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype.apply$extension__T__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf = (function($$this, xs) {
  var this$1 = $m_sci_Nil$();
  return new $c_Ljapgolly_scalajs_react_vdom_TagOf().init___T__sci_List__T($$this, new $c_sci_$colon$colon().init___O__sci_List(xs, this$1), $m_Ljapgolly_scalajs_react_vdom_Namespace$().Html$1)
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlTagOf$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlTagOf$: 0
}, false, "japgolly.scalajs.react.vdom.HtmlTagOf$", {
  Ljapgolly_scalajs_react_vdom_HtmlTagOf$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlTagOf$;
var $n_Ljapgolly_scalajs_react_vdom_HtmlTagOf$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_HtmlTagOf$)) {
    $n_Ljapgolly_scalajs_react_vdom_HtmlTagOf$ = new $c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_HtmlTagOf$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_HtmlTags$() {
  $c_O.call(this);
  this.a$module$1 = null;
  this.input$module$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlTags$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_HtmlTags$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype.a__Ljapgolly_scalajs_react_vdom_HtmlTags$a$ = (function() {
  if (($m_Ljapgolly_scalajs_react_vdom_HtmlTags$().a$module$1 === null)) {
    this.a$lzycompute$1__p1__V()
  };
  return $m_Ljapgolly_scalajs_react_vdom_HtmlTags$().a$module$1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype.a$lzycompute$1__p1__V = (function() {
  if (($m_Ljapgolly_scalajs_react_vdom_HtmlTags$().a$module$1 === null)) {
    $m_Ljapgolly_scalajs_react_vdom_HtmlTags$().a$module$1 = new $c_Ljapgolly_scalajs_react_vdom_HtmlTags$a$().init___Ljapgolly_scalajs_react_vdom_HtmlTags(this)
  }
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlTags$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlTags$: 0
}, false, "japgolly.scalajs.react.vdom.HtmlTags$", {
  Ljapgolly_scalajs_react_vdom_HtmlTags$: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_HtmlTags: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlTags$;
var $n_Ljapgolly_scalajs_react_vdom_HtmlTags$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_HtmlTags$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_HtmlTags$)) {
    $n_Ljapgolly_scalajs_react_vdom_HtmlTags$ = new $c_Ljapgolly_scalajs_react_vdom_HtmlTags$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_HtmlTags$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Namespace$() {
  $c_O.call(this);
  this.Html$1 = null;
  this.Svg$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Namespace$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Namespace$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Namespace$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Namespace$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Namespace$.prototype = $c_Ljapgolly_scalajs_react_vdom_Namespace$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Namespace$.prototype.init___ = (function() {
  this.Html$1 = "http://www.w3.org/1999/xhtml";
  this.Svg$1 = "http://www.w3.org/2000/svg";
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Namespace$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Namespace$: 0
}, false, "japgolly.scalajs.react.vdom.Namespace$", {
  Ljapgolly_scalajs_react_vdom_Namespace$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_Namespace$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Namespace$;
var $n_Ljapgolly_scalajs_react_vdom_Namespace$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Namespace$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Namespace$)) {
    $n_Ljapgolly_scalajs_react_vdom_Namespace$ = new $c_Ljapgolly_scalajs_react_vdom_Namespace$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Namespace$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_SvgTagOf$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_SvgTagOf$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_SvgTagOf$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype = $c_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype;
$c_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_SvgTagOf$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_SvgTagOf$: 0
}, false, "japgolly.scalajs.react.vdom.SvgTagOf$", {
  Ljapgolly_scalajs_react_vdom_SvgTagOf$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_SvgTagOf$;
var $n_Ljapgolly_scalajs_react_vdom_SvgTagOf$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_SvgTagOf$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_SvgTagOf$)) {
    $n_Ljapgolly_scalajs_react_vdom_SvgTagOf$ = new $c_Ljapgolly_scalajs_react_vdom_SvgTagOf$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_SvgTagOf$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype = $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  /*<skip>*/
});
var $d_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_TagMod$$anon$2: 0
}, false, "japgolly.scalajs.react.vdom.TagMod$$anon$2", {
  Ljapgolly_scalajs_react_vdom_TagMod$$anon$2: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3() {
  $c_O.call(this);
  this.f$1$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3.prototype = $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3.prototype;
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3.prototype.init___F1 = (function(f$1) {
  this.f$1$1 = f$1;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  this.f$1$1.apply__O__O(b)
});
var $d_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_TagMod$$anon$3: 0
}, false, "japgolly.scalajs.react.vdom.TagMod$$anon$3", {
  Ljapgolly_scalajs_react_vdom_TagMod$$anon$3: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_TagMod$$anon$3;
function $f_Ljapgolly_scalajs_react_vdom_VdomElement__rawNode__sjs_js_$bar($thiz) {
  var a = $thiz.rawElement__Ljapgolly_scalajs_react_raw_React$Element();
  return a
}
/** @constructor */
function $c_jl_Character$() {
  $c_O.call(this);
  this.java$lang$Character$$charTypesFirst256$1 = null;
  this.charTypeIndices$1 = null;
  this.charTypes$1 = null;
  this.isMirroredIndices$1 = null;
  this.nonASCIIZeroDigitCodePoints$1 = null;
  this.bitmap$0$1 = 0
}
$c_jl_Character$.prototype = new $h_O();
$c_jl_Character$.prototype.constructor = $c_jl_Character$;
/** @constructor */
function $h_jl_Character$() {
  /*<skip>*/
}
$h_jl_Character$.prototype = $c_jl_Character$.prototype;
$c_jl_Character$.prototype.init___ = (function() {
  return this
});
$c_jl_Character$.prototype.digitWithValidRadix__I__I__I = (function(codePoint, radix) {
  if ((codePoint < 256)) {
    var value = (((codePoint >= 48) && (codePoint <= 57)) ? (((-48) + codePoint) | 0) : (((codePoint >= 65) && (codePoint <= 90)) ? (((-55) + codePoint) | 0) : (((codePoint >= 97) && (codePoint <= 122)) ? (((-87) + codePoint) | 0) : (-1))))
  } else if (((codePoint >= 65313) && (codePoint <= 65338))) {
    var value = (((-65303) + codePoint) | 0)
  } else if (((codePoint >= 65345) && (codePoint <= 65370))) {
    var value = (((-65335) + codePoint) | 0)
  } else {
    var p = $m_ju_Arrays$().binarySearch__AI__I__I(this.nonASCIIZeroDigitCodePoints__p1__AI(), codePoint);
    var zeroCodePointIndex = ((p < 0) ? (((-2) - p) | 0) : p);
    if ((zeroCodePointIndex < 0)) {
      var value = (-1)
    } else {
      var v = ((codePoint - this.nonASCIIZeroDigitCodePoints__p1__AI().get(zeroCodePointIndex)) | 0);
      var value = ((v > 9) ? (-1) : v)
    }
  };
  return ((value < radix) ? value : (-1))
});
$c_jl_Character$.prototype.nonASCIIZeroDigitCodePoints__p1__AI = (function() {
  return (((((16 & this.bitmap$0$1) << 24) >> 24) === 0) ? this.nonASCIIZeroDigitCodePoints$lzycompute__p1__AI() : this.nonASCIIZeroDigitCodePoints$1)
});
$c_jl_Character$.prototype.nonASCIIZeroDigitCodePoints$lzycompute__p1__AI = (function() {
  if (((((16 & this.bitmap$0$1) << 24) >> 24) === 0)) {
    this.nonASCIIZeroDigitCodePoints$1 = $makeNativeArrayWrapper($d_I.getArrayOf(), [1632, 1776, 1984, 2406, 2534, 2662, 2790, 2918, 3046, 3174, 3302, 3430, 3664, 3792, 3872, 4160, 4240, 6112, 6160, 6470, 6608, 6784, 6800, 6992, 7088, 7232, 7248, 42528, 43216, 43264, 43472, 43600, 44016, 65296, 66720, 69734, 69872, 69942, 70096, 71360, 120782, 120792, 120802, 120812, 120822]);
    this.bitmap$0$1 = (((16 | this.bitmap$0$1) << 24) >> 24)
  };
  return this.nonASCIIZeroDigitCodePoints$1
});
var $d_jl_Character$ = new $TypeData().initClass({
  jl_Character$: 0
}, false, "java.lang.Character$", {
  jl_Character$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Character$.prototype.$classData = $d_jl_Character$;
var $n_jl_Character$ = (void 0);
function $m_jl_Character$() {
  if ((!$n_jl_Character$)) {
    $n_jl_Character$ = new $c_jl_Character$().init___()
  };
  return $n_jl_Character$
}
/** @constructor */
function $c_jl_Double$() {
  $c_O.call(this);
  this.doubleStrPat$1 = null;
  this.doubleStrHexPat$1 = null;
  this.bitmap$0$1 = 0
}
$c_jl_Double$.prototype = new $h_O();
$c_jl_Double$.prototype.constructor = $c_jl_Double$;
/** @constructor */
function $h_jl_Double$() {
  /*<skip>*/
}
$h_jl_Double$.prototype = $c_jl_Double$.prototype;
$c_jl_Double$.prototype.init___ = (function() {
  return this
});
$c_jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
var $d_jl_Double$ = new $TypeData().initClass({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Double$.prototype.$classData = $d_jl_Double$;
var $n_jl_Double$ = (void 0);
function $m_jl_Double$() {
  if ((!$n_jl_Double$)) {
    $n_jl_Double$ = new $c_jl_Double$().init___()
  };
  return $n_jl_Double$
}
/** @constructor */
function $c_jl_Integer$() {
  $c_O.call(this)
}
$c_jl_Integer$.prototype = new $h_O();
$c_jl_Integer$.prototype.constructor = $c_jl_Integer$;
/** @constructor */
function $h_jl_Integer$() {
  /*<skip>*/
}
$h_jl_Integer$.prototype = $c_jl_Integer$.prototype;
$c_jl_Integer$.prototype.init___ = (function() {
  return this
});
$c_jl_Integer$.prototype.fail$1__p1__T__sr_Nothing$ = (function(s$1) {
  throw new $c_jl_NumberFormatException().init___T((("For input string: \"" + s$1) + "\""))
});
$c_jl_Integer$.prototype.parseInt__T__I__I = (function(s, radix) {
  var len = ((s === null) ? 0 : $uI(s.length));
  if ((((len === 0) || (radix < 2)) || (radix > 36))) {
    this.fail$1__p1__T__sr_Nothing$(s)
  };
  var firstChar = (65535 & $uI(s.charCodeAt(0)));
  var negative = (firstChar === 45);
  var maxAbsValue = (negative ? 2.147483648E9 : 2.147483647E9);
  var i = ((negative || (firstChar === 43)) ? 1 : 0);
  if ((i >= $uI(s.length))) {
    this.fail$1__p1__T__sr_Nothing$(s)
  };
  var result = 0.0;
  while ((i !== len)) {
    var jsx$1 = $m_jl_Character$();
    var index = i;
    var digit = jsx$1.digitWithValidRadix__I__I__I((65535 & $uI(s.charCodeAt(index))), radix);
    result = ((result * radix) + digit);
    if (((digit === (-1)) || (result > maxAbsValue))) {
      this.fail$1__p1__T__sr_Nothing$(s)
    };
    i = ((1 + i) | 0)
  };
  if (negative) {
    var n = (-result);
    return $uI((n | 0))
  } else {
    var n$1 = result;
    return $uI((n$1 | 0))
  }
});
var $d_jl_Integer$ = new $TypeData().initClass({
  jl_Integer$: 0
}, false, "java.lang.Integer$", {
  jl_Integer$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Integer$.prototype.$classData = $d_jl_Integer$;
var $n_jl_Integer$ = (void 0);
function $m_jl_Integer$() {
  if ((!$n_jl_Integer$)) {
    $n_jl_Integer$ = new $c_jl_Integer$().init___()
  };
  return $n_jl_Integer$
}
/** @constructor */
function $c_jl_Number() {
  $c_O.call(this)
}
$c_jl_Number.prototype = new $h_O();
$c_jl_Number.prototype.constructor = $c_jl_Number;
/** @constructor */
function $h_jl_Number() {
  /*<skip>*/
}
$h_jl_Number.prototype = $c_jl_Number.prototype;
function $is_jl_Number(obj) {
  return ((obj instanceof $c_jl_Number) || ((typeof obj) === "number"))
}
function $as_jl_Number(obj) {
  return (($is_jl_Number(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Number"))
}
function $isArrayOf_jl_Number(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
}
function $asArrayOf_jl_Number(obj, depth) {
  return (($isArrayOf_jl_Number(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Number;", depth))
}
/** @constructor */
function $c_jl_Throwable() {
  $c_O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.enableSuppression$1 = false;
  this.writableStackTrace$1 = false;
  this.stackTrace$1 = null;
  this.suppressed$1 = null
}
$c_jl_Throwable.prototype = new $h_O();
$c_jl_Throwable.prototype.constructor = $c_jl_Throwable;
/** @constructor */
function $h_jl_Throwable() {
  /*<skip>*/
}
$h_jl_Throwable.prototype = $c_jl_Throwable.prototype;
$c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var v = $g.Error.captureStackTrace;
  if ((v === (void 0))) {
    try {
      var e$1 = {}.undef()
    } catch (e) {
      var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        if ((e$2 instanceof $c_sjs_js_JavaScriptException)) {
          var x5 = $as_sjs_js_JavaScriptException(e$2);
          var e$3 = x5.exception$4;
          var e$1 = e$3
        } else {
          var e$1;
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        }
      } else {
        var e$1;
        throw e
      }
    };
    this.stackdata = e$1
  } else {
    $g.Error.captureStackTrace(this);
    this.stackdata = this
  };
  return this
});
$c_jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
$c_jl_Throwable.prototype.toString__T = (function() {
  var className = $objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
$c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z = (function(s, e, enableSuppression, writableStackTrace) {
  this.s$1 = s;
  this.e$1 = e;
  this.enableSuppression$1 = enableSuppression;
  this.writableStackTrace$1 = writableStackTrace;
  if (writableStackTrace) {
    this.fillInStackTrace__jl_Throwable()
  };
  return this
});
function $as_jl_Throwable(obj) {
  return (((obj instanceof $c_jl_Throwable) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Throwable"))
}
function $isArrayOf_jl_Throwable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
}
function $asArrayOf_jl_Throwable(obj, depth) {
  return (($isArrayOf_jl_Throwable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
}
/** @constructor */
function $c_ju_AbstractMap() {
  $c_O.call(this)
}
$c_ju_AbstractMap.prototype = new $h_O();
$c_ju_AbstractMap.prototype.constructor = $c_ju_AbstractMap;
/** @constructor */
function $h_ju_AbstractMap() {
  /*<skip>*/
}
$h_ju_AbstractMap.prototype = $c_ju_AbstractMap.prototype;
$c_ju_AbstractMap.prototype.equals__O__Z = (function(o) {
  if ((o === this)) {
    return true
  } else if ($is_ju_Map(o)) {
    var x2 = $as_ju_Map(o);
    if ((this.contentSize$2 === x2.size__I())) {
      var __self = new $c_ju_HashMap$EntrySet().init___ju_HashMap(this);
      var __self$1 = __self.iterator__ju_Iterator();
      inlinereturn$7: {
        while (__self$1.hasNext__Z()) {
          var arg1 = __self$1.next__O();
          var item = $as_ju_Map$Entry(arg1);
          var a = x2.get__O__O(item.key$1);
          var b = item.value$1;
          if ((!((a === null) ? (b === null) : $objectEquals(a, b)))) {
            var jsx$1 = true;
            break inlinereturn$7
          }
        };
        var jsx$1 = false
      };
      return (!jsx$1)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_ju_AbstractMap.prototype.toString__T = (function() {
  var result = "{";
  var first = true;
  var iter = new $c_ju_HashMap$EntrySet().init___ju_HashMap(this).iterator__ju_Iterator();
  while (iter.hasNext__Z()) {
    var entry = $as_ju_Map$Entry(iter.next__O());
    if (first) {
      first = false
    } else {
      result = (result + ", ")
    };
    result = (((("" + result) + entry.key$1) + "=") + entry.value$1)
  };
  return (result + "}")
});
$c_ju_AbstractMap.prototype.hashCode__I = (function() {
  var __self = new $c_ju_HashMap$EntrySet().init___ju_HashMap(this);
  var __self$1 = __self.iterator__ju_Iterator();
  var result = 0;
  while (__self$1.hasNext__Z()) {
    var arg1 = result;
    var arg2 = __self$1.next__O();
    var prev = $uI(arg1);
    var item = $as_ju_Map$Entry(arg2);
    result = ((item.hashCode__I() + prev) | 0)
  };
  return $uI(result)
});
/** @constructor */
function $c_ju_HashMap$AbstractHashMapIterator() {
  $c_O.call(this);
  this.len$1 = 0;
  this.nextIdx$1 = 0;
  this.nextNode$1 = null;
  this.lastNode$1 = null;
  this.$$outer$1 = null
}
$c_ju_HashMap$AbstractHashMapIterator.prototype = new $h_O();
$c_ju_HashMap$AbstractHashMapIterator.prototype.constructor = $c_ju_HashMap$AbstractHashMapIterator;
/** @constructor */
function $h_ju_HashMap$AbstractHashMapIterator() {
  /*<skip>*/
}
$h_ju_HashMap$AbstractHashMapIterator.prototype = $c_ju_HashMap$AbstractHashMapIterator.prototype;
$c_ju_HashMap$AbstractHashMapIterator.prototype.next__O = (function() {
  if ((!this.hasNext__Z())) {
    throw new $c_ju_NoSuchElementException().init___T("next on empty iterator")
  };
  var node = this.nextNode$1;
  this.lastNode$1 = node;
  this.nextNode$1 = node.next$1;
  return node
});
$c_ju_HashMap$AbstractHashMapIterator.prototype.hasNext__Z = (function() {
  if ((this.nextNode$1 !== null)) {
    return true
  } else {
    while ((this.nextIdx$1 < this.len$1)) {
      var node = this.$$outer$1.java$util$HashMap$$table$f.get(this.nextIdx$1);
      this.nextIdx$1 = ((1 + this.nextIdx$1) | 0);
      if ((node !== null)) {
        this.nextNode$1 = node;
        return true
      }
    };
    return false
  }
});
$c_ju_HashMap$AbstractHashMapIterator.prototype.init___ju_HashMap = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.len$1 = $$outer.java$util$HashMap$$table$f.u.length;
  return this
});
/** @constructor */
function $c_ju_HashMap$Node() {
  $c_O.call(this);
  this.key$1 = null;
  this.hash$1 = 0;
  this.value$1 = null;
  this.previous$1 = null;
  this.next$1 = null
}
$c_ju_HashMap$Node.prototype = new $h_O();
$c_ju_HashMap$Node.prototype.constructor = $c_ju_HashMap$Node;
/** @constructor */
function $h_ju_HashMap$Node() {
  /*<skip>*/
}
$h_ju_HashMap$Node.prototype = $c_ju_HashMap$Node.prototype;
$c_ju_HashMap$Node.prototype.equals__O__Z = (function(that) {
  if ($is_ju_Map$Entry(that)) {
    var x2 = $as_ju_Map$Entry(that);
    var a = this.key$1;
    var b = x2.key$1;
    if (((a === null) ? (b === null) : $objectEquals(a, b))) {
      var a$1 = this.value$1;
      var b$1 = x2.value$1;
      return ((a$1 === null) ? (b$1 === null) : $objectEquals(a$1, b$1))
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_ju_HashMap$Node.prototype.toString__T = (function() {
  return ((this.key$1 + "=") + this.value$1)
});
$c_ju_HashMap$Node.prototype.init___O__I__O__ju_HashMap$Node__ju_HashMap$Node = (function(key, hash, value, previous, next) {
  this.key$1 = key;
  this.hash$1 = hash;
  this.value$1 = value;
  this.previous$1 = previous;
  this.next$1 = next;
  return this
});
$c_ju_HashMap$Node.prototype.hashCode__I = (function() {
  var improvedHash = this.hash$1;
  var o = this.value$1;
  return ((improvedHash ^ ((improvedHash >>> 16) | 0)) ^ ((o === null) ? 0 : $objectHashCode(o)))
});
var $d_ju_HashMap$Node = new $TypeData().initClass({
  ju_HashMap$Node: 0
}, false, "java.util.HashMap$Node", {
  ju_HashMap$Node: 1,
  O: 1,
  ju_Map$Entry: 1
});
$c_ju_HashMap$Node.prototype.$classData = $d_ju_HashMap$Node;
/** @constructor */
function $c_ju_regex_Matcher() {
  $c_O.call(this);
  this.pattern0$1 = null;
  this.input0$1 = null;
  this.regionStart0$1 = 0;
  this.regionEnd0$1 = 0;
  this.regexp$1 = null;
  this.inputstr$1 = null;
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = false;
  this.appendPos$1 = 0;
  this.startOfGroupCache$1 = null
}
$c_ju_regex_Matcher.prototype = new $h_O();
$c_ju_regex_Matcher.prototype.constructor = $c_ju_regex_Matcher;
/** @constructor */
function $h_ju_regex_Matcher() {
  /*<skip>*/
}
$h_ju_regex_Matcher.prototype = $c_ju_regex_Matcher.prototype;
$c_ju_regex_Matcher.prototype.find__Z = (function() {
  if (this.canStillFind$1) {
    this.lastMatchIsValid$1 = true;
    this.lastMatch$1 = this.regexp$1.exec(this.inputstr$1);
    if ((this.lastMatch$1 !== null)) {
      var value = this.lastMatch$1[0];
      if ((value === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var thiz = $as_T(value);
      if ((thiz === null)) {
        throw new $c_jl_NullPointerException().init___()
      };
      if ((thiz === "")) {
        var ev$1 = this.regexp$1;
        ev$1.lastIndex = ((1 + $uI(ev$1.lastIndex)) | 0)
      }
    } else {
      this.canStillFind$1 = false
    };
    this.startOfGroupCache$1 = null;
    return (this.lastMatch$1 !== null)
  } else {
    return false
  }
});
$c_ju_regex_Matcher.prototype.ensureLastMatch__p1__sjs_js_RegExp$ExecResult = (function() {
  if ((this.lastMatch$1 === null)) {
    throw new $c_jl_IllegalStateException().init___T("No match available")
  };
  return this.lastMatch$1
});
$c_ju_regex_Matcher.prototype.group__I__T = (function(group) {
  var value = this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult()[group];
  $m_s_$less$colon$less$();
  return $as_T(((value === (void 0)) ? null : value))
});
$c_ju_regex_Matcher.prototype.appendTail__jl_StringBuffer__jl_StringBuffer = (function(sb) {
  var thiz = this.inputstr$1;
  var beginIndex = this.appendPos$1;
  sb.append__T__jl_StringBuffer($as_T(thiz.substring(beginIndex)));
  var thiz$1 = this.inputstr$1;
  this.appendPos$1 = $uI(thiz$1.length);
  return sb
});
$c_ju_regex_Matcher.prototype.end__I = (function() {
  var jsx$1 = this.start__I();
  var thiz = this.group__T();
  return ((jsx$1 + $uI(thiz.length)) | 0)
});
$c_ju_regex_Matcher.prototype.init___ju_regex_Pattern__jl_CharSequence__I__I = (function(pattern0, input0, regionStart0, regionEnd0) {
  this.pattern0$1 = pattern0;
  this.input0$1 = input0;
  this.regionStart0$1 = regionStart0;
  this.regionEnd0$1 = regionEnd0;
  this.regexp$1 = this.pattern0$1.newJSRegExp__sjs_js_RegExp();
  this.inputstr$1 = $objectToString($charSequenceSubSequence(this.input0$1, this.regionStart0$1, this.regionEnd0$1));
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = true;
  this.appendPos$1 = 0;
  return this
});
$c_ju_regex_Matcher.prototype.appendReplacement__jl_StringBuffer__T__ju_regex_Matcher = (function(sb, replacement) {
  var thiz = this.inputstr$1;
  var beginIndex = this.appendPos$1;
  var endIndex = this.start__I();
  sb.append__T__jl_StringBuffer($as_T(thiz.substring(beginIndex, endIndex)));
  var len = $uI(replacement.length);
  var i = 0;
  while ((i < len)) {
    var index = i;
    var x1 = (65535 & $uI(replacement.charCodeAt(index)));
    switch (x1) {
      case 36: {
        i = ((1 + i) | 0);
        var j = i;
        while (true) {
          if ((i < len)) {
            var index$1 = i;
            var c = (65535 & $uI(replacement.charCodeAt(index$1)));
            var jsx$1 = ((c >= 48) && (c <= 57))
          } else {
            var jsx$1 = false
          };
          if (jsx$1) {
            i = ((1 + i) | 0)
          } else {
            break
          }
        };
        var this$8 = $m_jl_Integer$();
        var endIndex$1 = i;
        var s = $as_T(replacement.substring(j, endIndex$1));
        var group = this$8.parseInt__T__I__I(s, 10);
        sb.append__T__jl_StringBuffer(this.group__I__T(group));
        break
      }
      case 92: {
        i = ((1 + i) | 0);
        if ((i < len)) {
          var index$2 = i;
          sb.append__C__jl_StringBuffer((65535 & $uI(replacement.charCodeAt(index$2))))
        };
        i = ((1 + i) | 0);
        break
      }
      default: {
        sb.append__C__jl_StringBuffer(x1);
        i = ((1 + i) | 0)
      }
    }
  };
  this.appendPos$1 = this.end__I();
  return this
});
$c_ju_regex_Matcher.prototype.replaceAll__T__T = (function(replacement) {
  this.reset__ju_regex_Matcher();
  var sb = new $c_jl_StringBuffer().init___();
  while (this.find__Z()) {
    this.appendReplacement__jl_StringBuffer__T__ju_regex_Matcher(sb, replacement)
  };
  this.appendTail__jl_StringBuffer__jl_StringBuffer(sb);
  return sb.toString__T()
});
$c_ju_regex_Matcher.prototype.group__T = (function() {
  var value = this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult()[0];
  if ((value === (void 0))) {
    throw new $c_ju_NoSuchElementException().init___T("undefined.get")
  };
  return $as_T(value)
});
$c_ju_regex_Matcher.prototype.start__I = (function() {
  return $uI(this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult().index)
});
$c_ju_regex_Matcher.prototype.reset__ju_regex_Matcher = (function() {
  this.regexp$1.lastIndex = 0;
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = true;
  this.appendPos$1 = 0;
  this.startOfGroupCache$1 = null;
  return this
});
var $d_ju_regex_Matcher = new $TypeData().initClass({
  ju_regex_Matcher: 0
}, false, "java.util.regex.Matcher", {
  ju_regex_Matcher: 1,
  O: 1,
  ju_regex_MatchResult: 1
});
$c_ju_regex_Matcher.prototype.$classData = $d_ju_regex_Matcher;
/** @constructor */
function $c_ju_regex_Pattern() {
  $c_O.call(this);
  this.groupCount$1 = 0;
  this.groupStartMapper$1 = null;
  this.jsRegExp$1 = null;
  this.$$undpattern$1 = null;
  this.$$undflags$1 = 0;
  this.bitmap$0$1 = 0
}
$c_ju_regex_Pattern.prototype = new $h_O();
$c_ju_regex_Pattern.prototype.constructor = $c_ju_regex_Pattern;
/** @constructor */
function $h_ju_regex_Pattern() {
  /*<skip>*/
}
$h_ju_regex_Pattern.prototype = $c_ju_regex_Pattern.prototype;
$c_ju_regex_Pattern.prototype.jsFlags__p1__T = (function() {
  return ((($uZ(this.jsRegExp$1.global) ? "g" : "") + ($uZ(this.jsRegExp$1.ignoreCase) ? "i" : "")) + ($uZ(this.jsRegExp$1.multiline) ? "m" : ""))
});
$c_ju_regex_Pattern.prototype.jsPattern__p1__T = (function() {
  return $as_T(this.jsRegExp$1.source)
});
$c_ju_regex_Pattern.prototype.init___sjs_js_RegExp__T__I = (function(jsRegExp, _pattern, _flags) {
  this.jsRegExp$1 = jsRegExp;
  this.$$undpattern$1 = _pattern;
  this.$$undflags$1 = _flags;
  return this
});
$c_ju_regex_Pattern.prototype.toString__T = (function() {
  return this.$$undpattern$1
});
$c_ju_regex_Pattern.prototype.newJSRegExp__sjs_js_RegExp = (function() {
  var r = new $g.RegExp(this.jsRegExp$1);
  return ((r !== this.jsRegExp$1) ? r : new $g.RegExp(this.jsPattern__p1__T(), this.jsFlags__p1__T()))
});
var $d_ju_regex_Pattern = new $TypeData().initClass({
  ju_regex_Pattern: 0
}, false, "java.util.regex.Pattern", {
  ju_regex_Pattern: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_regex_Pattern.prototype.$classData = $d_ju_regex_Pattern;
/** @constructor */
function $c_ju_regex_Pattern$() {
  $c_O.call(this);
  this.java$util$regex$Pattern$$splitHackPat$1 = null;
  this.java$util$regex$Pattern$$flagHackPat$1 = null
}
$c_ju_regex_Pattern$.prototype = new $h_O();
$c_ju_regex_Pattern$.prototype.constructor = $c_ju_regex_Pattern$;
/** @constructor */
function $h_ju_regex_Pattern$() {
  /*<skip>*/
}
$h_ju_regex_Pattern$.prototype = $c_ju_regex_Pattern$.prototype;
$c_ju_regex_Pattern$.prototype.init___ = (function() {
  $n_ju_regex_Pattern$ = this;
  this.java$util$regex$Pattern$$splitHackPat$1 = new $g.RegExp("^\\\\Q(.|\\n|\\r)\\\\E$");
  this.java$util$regex$Pattern$$flagHackPat$1 = new $g.RegExp("^\\(\\?([idmsuxU]*)(?:-([idmsuxU]*))?\\)");
  return this
});
$c_ju_regex_Pattern$.prototype.compile__T__I__ju_regex_Pattern = (function(regex, flags) {
  if (((16 & flags) !== 0)) {
    var x1 = new $c_T2().init___O__O(this.quote__T__T(regex), flags)
  } else {
    var m = this.java$util$regex$Pattern$$splitHackPat$1.exec(regex);
    if ((m !== null)) {
      var value = m[1];
      if ((value === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var this$5 = new $c_s_Some().init___O(new $c_T2().init___O__O(this.quote__T__T($as_T(value)), flags))
    } else {
      var this$5 = $m_s_None$()
    };
    if (this$5.isEmpty__Z()) {
      var this$6 = $m_ju_regex_Pattern$();
      var m$1 = this$6.java$util$regex$Pattern$$flagHackPat$1.exec(regex);
      if ((m$1 !== null)) {
        var value$1 = m$1[0];
        if ((value$1 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        var thiz = $as_T(value$1);
        var beginIndex = $uI(thiz.length);
        var newPat = $as_T(regex.substring(beginIndex));
        var elem$1 = 0;
        elem$1 = flags;
        var value$2 = m$1[1];
        if ((value$2 !== (void 0))) {
          var chars = $as_T(value$2);
          var end = $uI(chars.length);
          var i = 0;
          while ((i < end)) {
            var arg1 = i;
            elem$1 = (elem$1 | $m_ju_regex_Pattern$().java$util$regex$Pattern$$charToFlag__C__I((65535 & $uI(chars.charCodeAt(arg1)))));
            i = ((1 + i) | 0)
          }
        };
        var value$3 = m$1[2];
        if ((value$3 !== (void 0))) {
          var chars$3 = $as_T(value$3);
          var end$1 = $uI(chars$3.length);
          var i$1 = 0;
          while ((i$1 < end$1)) {
            var arg1$1 = i$1;
            elem$1 = (elem$1 & (~$m_ju_regex_Pattern$().java$util$regex$Pattern$$charToFlag__C__I((65535 & $uI(chars$3.charCodeAt(arg1$1))))));
            i$1 = ((1 + i$1) | 0)
          }
        };
        var this$33 = new $c_s_Some().init___O(new $c_T2().init___O__O(newPat, elem$1))
      } else {
        var this$33 = $m_s_None$()
      }
    } else {
      var this$33 = this$5
    };
    var x1 = $as_T2((this$33.isEmpty__Z() ? new $c_T2().init___O__O(regex, flags) : this$33.get__O()))
  };
  if ((x1 === null)) {
    throw new $c_s_MatchError().init___O(x1)
  };
  var jsPattern = $as_T(x1.$$und1$f);
  var flags1 = $uI(x1.$$und2$f);
  var jsFlags = (("g" + (((2 & flags1) !== 0) ? "i" : "")) + (((8 & flags1) !== 0) ? "m" : ""));
  var jsRegExp = new $g.RegExp(jsPattern, jsFlags);
  return new $c_ju_regex_Pattern().init___sjs_js_RegExp__T__I(jsRegExp, regex, flags1)
});
$c_ju_regex_Pattern$.prototype.quote__T__T = (function(s) {
  var result = "";
  var i = 0;
  while ((i < $uI(s.length))) {
    var index = i;
    var c = (65535 & $uI(s.charCodeAt(index)));
    var jsx$2 = result;
    switch (c) {
      case 92:
      case 46:
      case 40:
      case 41:
      case 91:
      case 93:
      case 123:
      case 125:
      case 124:
      case 63:
      case 42:
      case 43:
      case 94:
      case 36: {
        var jsx$1 = ("\\" + new $c_jl_Character().init___C(c));
        break
      }
      default: {
        var jsx$1 = new $c_jl_Character().init___C(c)
      }
    };
    result = (("" + jsx$2) + jsx$1);
    i = ((1 + i) | 0)
  };
  return result
});
$c_ju_regex_Pattern$.prototype.java$util$regex$Pattern$$charToFlag__C__I = (function(c) {
  switch (c) {
    case 105: {
      return 2;
      break
    }
    case 100: {
      return 1;
      break
    }
    case 109: {
      return 8;
      break
    }
    case 115: {
      return 32;
      break
    }
    case 117: {
      return 64;
      break
    }
    case 120: {
      return 4;
      break
    }
    case 85: {
      return 256;
      break
    }
    default: {
      throw new $c_jl_IllegalArgumentException().init___T("bad in-pattern flag")
    }
  }
});
var $d_ju_regex_Pattern$ = new $TypeData().initClass({
  ju_regex_Pattern$: 0
}, false, "java.util.regex.Pattern$", {
  ju_regex_Pattern$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_regex_Pattern$.prototype.$classData = $d_ju_regex_Pattern$;
var $n_ju_regex_Pattern$ = (void 0);
function $m_ju_regex_Pattern$() {
  if ((!$n_ju_regex_Pattern$)) {
    $n_ju_regex_Pattern$ = new $c_ju_regex_Pattern$().init___()
  };
  return $n_ju_regex_Pattern$
}
/** @constructor */
function $c_s_$less$colon$less$() {
  $c_O.call(this);
  this.singleton$1 = null
}
$c_s_$less$colon$less$.prototype = new $h_O();
$c_s_$less$colon$less$.prototype.constructor = $c_s_$less$colon$less$;
/** @constructor */
function $h_s_$less$colon$less$() {
  /*<skip>*/
}
$h_s_$less$colon$less$.prototype = $c_s_$less$colon$less$.prototype;
$c_s_$less$colon$less$.prototype.init___ = (function() {
  $n_s_$less$colon$less$ = this;
  this.singleton$1 = new $c_s_$less$colon$less$$anon$1().init___();
  return this
});
var $d_s_$less$colon$less$ = new $TypeData().initClass({
  s_$less$colon$less$: 0
}, false, "scala.$less$colon$less$", {
  s_$less$colon$less$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_$less$colon$less$.prototype.$classData = $d_s_$less$colon$less$;
var $n_s_$less$colon$less$ = (void 0);
function $m_s_$less$colon$less$() {
  if ((!$n_s_$less$colon$less$)) {
    $n_s_$less$colon$less$ = new $c_s_$less$colon$less$().init___()
  };
  return $n_s_$less$colon$less$
}
/** @constructor */
function $c_s_Array$() {
  $c_O.call(this)
}
$c_s_Array$.prototype = new $h_O();
$c_s_Array$.prototype.constructor = $c_s_Array$;
/** @constructor */
function $h_s_Array$() {
  /*<skip>*/
}
$h_s_Array$.prototype = $c_s_Array$.prototype;
$c_s_Array$.prototype.init___ = (function() {
  return this
});
$c_s_Array$.prototype.copy__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var srcClass = $objectGetClass(src);
  if ((srcClass.isArray__Z() && $objectGetClass(dest).isAssignableFrom__jl_Class__Z(srcClass))) {
    $systemArraycopy(src, srcPos, dest, destPos, length)
  } else {
    this.slowcopy__p1__O__I__O__I__I__V(src, srcPos, dest, destPos, length)
  }
});
$c_s_Array$.prototype.slowcopy__p1__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var i = srcPos;
  var j = destPos;
  var srcUntil = ((srcPos + length) | 0);
  while ((i < srcUntil)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(dest, j, $m_sr_ScalaRunTime$().array$undapply__O__I__O(src, i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
var $d_s_Array$ = new $TypeData().initClass({
  s_Array$: 0
}, false, "scala.Array$", {
  s_Array$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_Array$.prototype.$classData = $d_s_Array$;
var $n_s_Array$ = (void 0);
function $m_s_Array$() {
  if ((!$n_s_Array$)) {
    $n_s_Array$ = new $c_s_Array$().init___()
  };
  return $n_s_Array$
}
/** @constructor */
function $c_s_Option$() {
  $c_O.call(this)
}
$c_s_Option$.prototype = new $h_O();
$c_s_Option$.prototype.constructor = $c_s_Option$;
/** @constructor */
function $h_s_Option$() {
  /*<skip>*/
}
$h_s_Option$.prototype = $c_s_Option$.prototype;
$c_s_Option$.prototype.init___ = (function() {
  return this
});
$c_s_Option$.prototype.apply__O__s_Option = (function(x) {
  return ((x === null) ? $m_s_None$() : new $c_s_Some().init___O(x))
});
var $d_s_Option$ = new $TypeData().initClass({
  s_Option$: 0
}, false, "scala.Option$", {
  s_Option$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_Option$.prototype.$classData = $d_s_Option$;
var $n_s_Option$ = (void 0);
function $m_s_Option$() {
  if ((!$n_s_Option$)) {
    $n_s_Option$ = new $c_s_Option$().init___()
  };
  return $n_s_Option$
}
function $f_s_Product2__productElement__I__O($thiz, n) {
  switch (n) {
    case 0: {
      return $thiz.$$und1$f;
      break
    }
    case 1: {
      return $thiz.$$und2$f;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T((n + " is out of bounds (min 0, max 1)"))
    }
  }
}
/** @constructor */
function $c_s_math_Fractional$() {
  $c_O.call(this)
}
$c_s_math_Fractional$.prototype = new $h_O();
$c_s_math_Fractional$.prototype.constructor = $c_s_math_Fractional$;
/** @constructor */
function $h_s_math_Fractional$() {
  /*<skip>*/
}
$h_s_math_Fractional$.prototype = $c_s_math_Fractional$.prototype;
$c_s_math_Fractional$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Fractional$ = new $TypeData().initClass({
  s_math_Fractional$: 0
}, false, "scala.math.Fractional$", {
  s_math_Fractional$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Fractional$.prototype.$classData = $d_s_math_Fractional$;
var $n_s_math_Fractional$ = (void 0);
function $m_s_math_Fractional$() {
  if ((!$n_s_math_Fractional$)) {
    $n_s_math_Fractional$ = new $c_s_math_Fractional$().init___()
  };
  return $n_s_math_Fractional$
}
/** @constructor */
function $c_s_math_Integral$() {
  $c_O.call(this)
}
$c_s_math_Integral$.prototype = new $h_O();
$c_s_math_Integral$.prototype.constructor = $c_s_math_Integral$;
/** @constructor */
function $h_s_math_Integral$() {
  /*<skip>*/
}
$h_s_math_Integral$.prototype = $c_s_math_Integral$.prototype;
$c_s_math_Integral$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Integral$ = new $TypeData().initClass({
  s_math_Integral$: 0
}, false, "scala.math.Integral$", {
  s_math_Integral$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Integral$.prototype.$classData = $d_s_math_Integral$;
var $n_s_math_Integral$ = (void 0);
function $m_s_math_Integral$() {
  if ((!$n_s_math_Integral$)) {
    $n_s_math_Integral$ = new $c_s_math_Integral$().init___()
  };
  return $n_s_math_Integral$
}
/** @constructor */
function $c_s_math_Numeric$() {
  $c_O.call(this)
}
$c_s_math_Numeric$.prototype = new $h_O();
$c_s_math_Numeric$.prototype.constructor = $c_s_math_Numeric$;
/** @constructor */
function $h_s_math_Numeric$() {
  /*<skip>*/
}
$h_s_math_Numeric$.prototype = $c_s_math_Numeric$.prototype;
$c_s_math_Numeric$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Numeric$ = new $TypeData().initClass({
  s_math_Numeric$: 0
}, false, "scala.math.Numeric$", {
  s_math_Numeric$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Numeric$.prototype.$classData = $d_s_math_Numeric$;
var $n_s_math_Numeric$ = (void 0);
function $m_s_math_Numeric$() {
  if ((!$n_s_math_Numeric$)) {
    $n_s_math_Numeric$ = new $c_s_math_Numeric$().init___()
  };
  return $n_s_math_Numeric$
}
/** @constructor */
function $c_s_package$$anon$1() {
  $c_O.call(this)
}
$c_s_package$$anon$1.prototype = new $h_O();
$c_s_package$$anon$1.prototype.constructor = $c_s_package$$anon$1;
/** @constructor */
function $h_s_package$$anon$1() {
  /*<skip>*/
}
$h_s_package$$anon$1.prototype = $c_s_package$$anon$1.prototype;
$c_s_package$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_package$$anon$1.prototype.toString__T = (function() {
  return "object AnyRef"
});
var $d_s_package$$anon$1 = new $TypeData().initClass({
  s_package$$anon$1: 0
}, false, "scala.package$$anon$1", {
  s_package$$anon$1: 1,
  O: 1,
  s_Specializable: 1
});
$c_s_package$$anon$1.prototype.$classData = $d_s_package$$anon$1;
/** @constructor */
function $c_s_reflect_ClassTag$() {
  $c_O.call(this)
}
$c_s_reflect_ClassTag$.prototype = new $h_O();
$c_s_reflect_ClassTag$.prototype.constructor = $c_s_reflect_ClassTag$;
/** @constructor */
function $h_s_reflect_ClassTag$() {
  /*<skip>*/
}
$h_s_reflect_ClassTag$.prototype = $c_s_reflect_ClassTag$.prototype;
$c_s_reflect_ClassTag$.prototype.init___ = (function() {
  return this
});
$c_s_reflect_ClassTag$.prototype.apply__jl_Class__s_reflect_ClassTag = (function(runtimeClass1) {
  return ((runtimeClass1 === $d_B.getClassOf()) ? $m_s_reflect_ManifestFactory$ByteManifest$() : ((runtimeClass1 === $d_S.getClassOf()) ? $m_s_reflect_ManifestFactory$ShortManifest$() : ((runtimeClass1 === $d_C.getClassOf()) ? $m_s_reflect_ManifestFactory$CharManifest$() : ((runtimeClass1 === $d_I.getClassOf()) ? $m_s_reflect_ManifestFactory$IntManifest$() : ((runtimeClass1 === $d_J.getClassOf()) ? $m_s_reflect_ManifestFactory$LongManifest$() : ((runtimeClass1 === $d_F.getClassOf()) ? $m_s_reflect_ManifestFactory$FloatManifest$() : ((runtimeClass1 === $d_D.getClassOf()) ? $m_s_reflect_ManifestFactory$DoubleManifest$() : ((runtimeClass1 === $d_Z.getClassOf()) ? $m_s_reflect_ManifestFactory$BooleanManifest$() : ((runtimeClass1 === $d_V.getClassOf()) ? $m_s_reflect_ManifestFactory$UnitManifest$() : ((runtimeClass1 === $d_O.getClassOf()) ? $m_s_reflect_ManifestFactory$ObjectManifest$() : ((runtimeClass1 === $d_sr_Nothing$.getClassOf()) ? $m_s_reflect_ManifestFactory$NothingManifest$() : ((runtimeClass1 === $d_sr_Null$.getClassOf()) ? $m_s_reflect_ManifestFactory$NullManifest$() : new $c_s_reflect_ClassTag$GenericClassTag().init___jl_Class(runtimeClass1)))))))))))))
});
var $d_s_reflect_ClassTag$ = new $TypeData().initClass({
  s_reflect_ClassTag$: 0
}, false, "scala.reflect.ClassTag$", {
  s_reflect_ClassTag$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_reflect_ClassTag$.prototype.$classData = $d_s_reflect_ClassTag$;
var $n_s_reflect_ClassTag$ = (void 0);
function $m_s_reflect_ClassTag$() {
  if ((!$n_s_reflect_ClassTag$)) {
    $n_s_reflect_ClassTag$ = new $c_s_reflect_ClassTag$().init___()
  };
  return $n_s_reflect_ClassTag$
}
/** @constructor */
function $c_s_util_Either$() {
  $c_O.call(this)
}
$c_s_util_Either$.prototype = new $h_O();
$c_s_util_Either$.prototype.constructor = $c_s_util_Either$;
/** @constructor */
function $h_s_util_Either$() {
  /*<skip>*/
}
$h_s_util_Either$.prototype = $c_s_util_Either$.prototype;
$c_s_util_Either$.prototype.init___ = (function() {
  return this
});
var $d_s_util_Either$ = new $TypeData().initClass({
  s_util_Either$: 0
}, false, "scala.util.Either$", {
  s_util_Either$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Either$.prototype.$classData = $d_s_util_Either$;
var $n_s_util_Either$ = (void 0);
function $m_s_util_Either$() {
  if ((!$n_s_util_Either$)) {
    $n_s_util_Either$ = new $c_s_util_Either$().init___()
  };
  return $n_s_util_Either$
}
/** @constructor */
function $c_s_util_Left$() {
  $c_O.call(this)
}
$c_s_util_Left$.prototype = new $h_O();
$c_s_util_Left$.prototype.constructor = $c_s_util_Left$;
/** @constructor */
function $h_s_util_Left$() {
  /*<skip>*/
}
$h_s_util_Left$.prototype = $c_s_util_Left$.prototype;
$c_s_util_Left$.prototype.init___ = (function() {
  return this
});
$c_s_util_Left$.prototype.toString__T = (function() {
  return "Left"
});
var $d_s_util_Left$ = new $TypeData().initClass({
  s_util_Left$: 0
}, false, "scala.util.Left$", {
  s_util_Left$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Left$.prototype.$classData = $d_s_util_Left$;
var $n_s_util_Left$ = (void 0);
function $m_s_util_Left$() {
  if ((!$n_s_util_Left$)) {
    $n_s_util_Left$ = new $c_s_util_Left$().init___()
  };
  return $n_s_util_Left$
}
/** @constructor */
function $c_s_util_Right$() {
  $c_O.call(this)
}
$c_s_util_Right$.prototype = new $h_O();
$c_s_util_Right$.prototype.constructor = $c_s_util_Right$;
/** @constructor */
function $h_s_util_Right$() {
  /*<skip>*/
}
$h_s_util_Right$.prototype = $c_s_util_Right$.prototype;
$c_s_util_Right$.prototype.init___ = (function() {
  return this
});
$c_s_util_Right$.prototype.toString__T = (function() {
  return "Right"
});
var $d_s_util_Right$ = new $TypeData().initClass({
  s_util_Right$: 0
}, false, "scala.util.Right$", {
  s_util_Right$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Right$.prototype.$classData = $d_s_util_Right$;
var $n_s_util_Right$ = (void 0);
function $m_s_util_Right$() {
  if ((!$n_s_util_Right$)) {
    $n_s_util_Right$ = new $c_s_util_Right$().init___()
  };
  return $n_s_util_Right$
}
/** @constructor */
function $c_s_util_hashing_MurmurHash3$() {
  $c_s_util_hashing_MurmurHash3.call(this);
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0;
  this.emptyMapHash$2 = 0
}
$c_s_util_hashing_MurmurHash3$.prototype = new $h_s_util_hashing_MurmurHash3();
$c_s_util_hashing_MurmurHash3$.prototype.constructor = $c_s_util_hashing_MurmurHash3$;
/** @constructor */
function $h_s_util_hashing_MurmurHash3$() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3$.prototype = $c_s_util_hashing_MurmurHash3$.prototype;
$c_s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  $n_s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Set");
  this.emptyMapHash$2 = this.unorderedHash__sc_IterableOnce__I__I($m_sci_Nil$(), this.mapSeed$2);
  return this
});
$c_s_util_hashing_MurmurHash3$.prototype.seqHash__sc_Seq__I = (function(xs) {
  if ($is_sc_IndexedSeq(xs)) {
    var x2 = $as_sc_IndexedSeq(xs);
    return this.indexedSeqHash__sc_IndexedSeq__I__I(x2, this.seqSeed$2)
  } else if ((xs instanceof $c_sci_List)) {
    var x3 = $as_sci_List(xs);
    return this.listHash__sci_List__I__I(x3, this.seqSeed$2)
  } else {
    return this.orderedHash__sc_IterableOnce__I__I(xs, this.seqSeed$2)
  }
});
$c_s_util_hashing_MurmurHash3$.prototype.mapHash__sc_Map__I = (function(xs) {
  if ($f_sc_IterableOnceOps__isEmpty__Z(xs)) {
    return this.emptyMapHash$2
  } else {
    var accum = new $c_s_util_hashing_MurmurHash3$accum$1().init___();
    var h = this.mapSeed$2;
    $f_sc_MapOps__foreachEntry__F2__V(xs, accum);
    h = this.mix__I__I__I(h, accum.a$1);
    h = this.mix__I__I__I(h, accum.b$1);
    h = this.mixLast__I__I__I(h, accum.c$1);
    return this.finalizeHash__I__I__I(h, accum.n$1)
  }
});
$c_s_util_hashing_MurmurHash3$.prototype.tuple2Hash__O__O__I = (function(x, y) {
  return this.tuple2Hash__I__I__I__I($m_sr_Statics$().anyHash__O__I(x), $m_sr_Statics$().anyHash__O__I(y), (-889275714))
});
var $d_s_util_hashing_MurmurHash3$ = new $TypeData().initClass({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
$c_s_util_hashing_MurmurHash3$.prototype.$classData = $d_s_util_hashing_MurmurHash3$;
var $n_s_util_hashing_MurmurHash3$ = (void 0);
function $m_s_util_hashing_MurmurHash3$() {
  if ((!$n_s_util_hashing_MurmurHash3$)) {
    $n_s_util_hashing_MurmurHash3$ = new $c_s_util_hashing_MurmurHash3$().init___()
  };
  return $n_s_util_hashing_MurmurHash3$
}
/** @constructor */
function $c_s_util_hashing_MurmurHash3$accum$1() {
  $c_O.call(this);
  this.a$1 = 0;
  this.b$1 = 0;
  this.n$1 = 0;
  this.c$1 = 0
}
$c_s_util_hashing_MurmurHash3$accum$1.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3$accum$1.prototype.constructor = $c_s_util_hashing_MurmurHash3$accum$1;
/** @constructor */
function $h_s_util_hashing_MurmurHash3$accum$1() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3$accum$1.prototype = $c_s_util_hashing_MurmurHash3$accum$1.prototype;
$c_s_util_hashing_MurmurHash3$accum$1.prototype.init___ = (function() {
  this.a$1 = 0;
  this.b$1 = 0;
  this.n$1 = 0;
  this.c$1 = 1;
  return this
});
$c_s_util_hashing_MurmurHash3$accum$1.prototype.apply__O__O__V = (function(k, v) {
  var h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(k, v);
  this.a$1 = ((this.a$1 + h) | 0);
  this.b$1 = (this.b$1 ^ h);
  this.c$1 = $imul(this.c$1, (1 | h));
  this.n$1 = ((1 + this.n$1) | 0)
});
$c_s_util_hashing_MurmurHash3$accum$1.prototype.toString__T = (function() {
  return "<function2>"
});
$c_s_util_hashing_MurmurHash3$accum$1.prototype.apply__O__O__O = (function(v1, v2) {
  this.apply__O__O__V(v1, v2)
});
var $d_s_util_hashing_MurmurHash3$accum$1 = new $TypeData().initClass({
  s_util_hashing_MurmurHash3$accum$1: 0
}, false, "scala.util.hashing.MurmurHash3$accum$1", {
  s_util_hashing_MurmurHash3$accum$1: 1,
  O: 1,
  F2: 1
});
$c_s_util_hashing_MurmurHash3$accum$1.prototype.$classData = $d_s_util_hashing_MurmurHash3$accum$1;
function $f_sc_IterableOps__tail__O($thiz) {
  if ($thiz.isEmpty__Z()) {
    throw new $c_jl_UnsupportedOperationException().init___()
  };
  return $thiz.drop__I__O(1)
}
function $f_sc_IterableOps__drop__I__O($thiz, n) {
  return $thiz.fromSpecific__sc_IterableOnce__O(new $c_sc_View$Drop().init___sc_IterableOps__I($thiz, n))
}
function $f_sc_IterableOps__sizeCompare__I__I($thiz, otherSize) {
  if ((otherSize < 0)) {
    return 1
  } else {
    var known = $thiz.knownSize__I();
    if ((known >= 0)) {
      return ((known === otherSize) ? 0 : ((known < otherSize) ? (-1) : 1))
    } else {
      var i = 0;
      var it = $thiz.iterator__sc_Iterator();
      while (it.hasNext__Z()) {
        if ((i === otherSize)) {
          return 1
        };
        it.next__O();
        i = ((1 + i) | 0)
      };
      return ((i - otherSize) | 0)
    }
  }
}
function $is_sc_IterableOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IterableOps)))
}
function $as_sc_IterableOps(obj) {
  return (($is_sc_IterableOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IterableOps"))
}
function $isArrayOf_sc_IterableOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IterableOps)))
}
function $asArrayOf_sc_IterableOps(obj, depth) {
  return (($isArrayOf_sc_IterableOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IterableOps;", depth))
}
function $f_sc_Iterator__concat__F0__sc_Iterator($thiz, xs) {
  return new $c_sc_Iterator$ConcatIterator().init___sc_Iterator($thiz).concat__F0__sc_Iterator(xs)
}
function $f_sc_Iterator__sameElements__sc_IterableOnce__Z($thiz, that) {
  var those = that.iterator__sc_Iterator();
  while (($thiz.hasNext__Z() && those.hasNext__Z())) {
    if ((!$m_sr_BoxesRunTime$().equals__O__O__Z($thiz.next__O(), those.next__O()))) {
      return false
    }
  };
  return ($thiz.hasNext__Z() === those.hasNext__Z())
}
function $f_sc_Iterator__isEmpty__Z($thiz) {
  return (!$thiz.hasNext__Z())
}
function $f_sc_Iterator__drop__I__sc_Iterator($thiz, n) {
  var i = 0;
  while (((i < n) && $thiz.hasNext__Z())) {
    $thiz.next__O();
    i = ((1 + i) | 0)
  };
  return $thiz
}
function $is_sc_Iterator(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Iterator)))
}
function $as_sc_Iterator(obj) {
  return (($is_sc_Iterator(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Iterator"))
}
function $isArrayOf_sc_Iterator(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Iterator)))
}
function $asArrayOf_sc_Iterator(obj, depth) {
  return (($isArrayOf_sc_Iterator(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Iterator;", depth))
}
/** @constructor */
function $c_sc_WithFilter() {
  $c_O.call(this)
}
$c_sc_WithFilter.prototype = new $h_O();
$c_sc_WithFilter.prototype.constructor = $c_sc_WithFilter;
/** @constructor */
function $h_sc_WithFilter() {
  /*<skip>*/
}
$h_sc_WithFilter.prototype = $c_sc_WithFilter.prototype;
/** @constructor */
function $c_sci_$colon$colon$() {
  $c_O.call(this)
}
$c_sci_$colon$colon$.prototype = new $h_O();
$c_sci_$colon$colon$.prototype.constructor = $c_sci_$colon$colon$;
/** @constructor */
function $h_sci_$colon$colon$() {
  /*<skip>*/
}
$h_sci_$colon$colon$.prototype = $c_sci_$colon$colon$.prototype;
$c_sci_$colon$colon$.prototype.init___ = (function() {
  return this
});
$c_sci_$colon$colon$.prototype.toString__T = (function() {
  return "::"
});
var $d_sci_$colon$colon$ = new $TypeData().initClass({
  sci_$colon$colon$: 0
}, false, "scala.collection.immutable.$colon$colon$", {
  sci_$colon$colon$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon$.prototype.$classData = $d_sci_$colon$colon$;
var $n_sci_$colon$colon$ = (void 0);
function $m_sci_$colon$colon$() {
  if ((!$n_sci_$colon$colon$)) {
    $n_sci_$colon$colon$ = new $c_sci_$colon$colon$().init___()
  };
  return $n_sci_$colon$colon$
}
/** @constructor */
function $c_sci_List$$anon$1() {
  $c_O.call(this)
}
$c_sci_List$$anon$1.prototype = new $h_O();
$c_sci_List$$anon$1.prototype.constructor = $c_sci_List$$anon$1;
/** @constructor */
function $h_sci_List$$anon$1() {
  /*<skip>*/
}
$h_sci_List$$anon$1.prototype = $c_sci_List$$anon$1.prototype;
$c_sci_List$$anon$1.prototype.init___ = (function() {
  return this
});
$c_sci_List$$anon$1.prototype.compose__F1__F1 = (function(g) {
  return $f_F1__compose__F1__F1(this, g)
});
$c_sci_List$$anon$1.prototype.apply__O__O = (function(x) {
  return this
});
$c_sci_List$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
var $d_sci_List$$anon$1 = new $TypeData().initClass({
  sci_List$$anon$1: 0
}, false, "scala.collection.immutable.List$$anon$1", {
  sci_List$$anon$1: 1,
  O: 1,
  F1: 1
});
$c_sci_List$$anon$1.prototype.$classData = $d_sci_List$$anon$1;
/** @constructor */
function $c_sci_Range$() {
  $c_O.call(this)
}
$c_sci_Range$.prototype = new $h_O();
$c_sci_Range$.prototype.constructor = $c_sci_Range$;
/** @constructor */
function $h_sci_Range$() {
  /*<skip>*/
}
$h_sci_Range$.prototype = $c_sci_Range$.prototype;
$c_sci_Range$.prototype.init___ = (function() {
  return this
});
var $d_sci_Range$ = new $TypeData().initClass({
  sci_Range$: 0
}, false, "scala.collection.immutable.Range$", {
  sci_Range$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Range$.prototype.$classData = $d_sci_Range$;
var $n_sci_Range$ = (void 0);
function $m_sci_Range$() {
  if ((!$n_sci_Range$)) {
    $n_sci_Range$ = new $c_sci_Range$().init___()
  };
  return $n_sci_Range$
}
function $is_scm_Builder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Builder)))
}
function $as_scm_Builder(obj) {
  return (($is_scm_Builder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.Builder"))
}
function $isArrayOf_scm_Builder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Builder)))
}
function $asArrayOf_scm_Builder(obj, depth) {
  return (($isArrayOf_scm_Builder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.Builder;", depth))
}
/** @constructor */
function $c_scm_StringBuilder$() {
  $c_O.call(this)
}
$c_scm_StringBuilder$.prototype = new $h_O();
$c_scm_StringBuilder$.prototype.constructor = $c_scm_StringBuilder$;
/** @constructor */
function $h_scm_StringBuilder$() {
  /*<skip>*/
}
$h_scm_StringBuilder$.prototype = $c_scm_StringBuilder$.prototype;
$c_scm_StringBuilder$.prototype.init___ = (function() {
  return this
});
var $d_scm_StringBuilder$ = new $TypeData().initClass({
  scm_StringBuilder$: 0
}, false, "scala.collection.mutable.StringBuilder$", {
  scm_StringBuilder$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder$.prototype.$classData = $d_scm_StringBuilder$;
var $n_scm_StringBuilder$ = (void 0);
function $m_scm_StringBuilder$() {
  if ((!$n_scm_StringBuilder$)) {
    $n_scm_StringBuilder$ = new $c_scm_StringBuilder$().init___()
  };
  return $n_scm_StringBuilder$
}
/** @constructor */
function $c_sjsr_RuntimeLong$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
  this.Zero$1 = null
}
$c_sjsr_RuntimeLong$.prototype = new $h_O();
$c_sjsr_RuntimeLong$.prototype.constructor = $c_sjsr_RuntimeLong$;
/** @constructor */
function $h_sjsr_RuntimeLong$() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong$.prototype = $c_sjsr_RuntimeLong$.prototype;
$c_sjsr_RuntimeLong$.prototype.init___ = (function() {
  $n_sjsr_RuntimeLong$ = this;
  this.Zero$1 = new $c_sjsr_RuntimeLong().init___I__I(0, 0);
  return this
});
$c_sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
$c_sjsr_RuntimeLong$.prototype.toUnsignedString__p1__I__I__T = (function(lo, hi) {
  if ((((-2097152) & hi) === 0)) {
    var this$5 = ((4.294967296E9 * hi) + $uD((lo >>> 0)));
    return ("" + this$5)
  } else {
    return $as_T(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(lo, hi, 1000000000, 0, 2))
  }
});
$c_sjsr_RuntimeLong$.prototype.divideImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if (((alo === (-2147483648)) && (blo === (-1)))) {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return (-2147483648)
      } else {
        var lo = ((alo / blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-1);
      return (-1)
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$div__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if ((neg === neg$1)) {
      return absRLo
    } else {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D = (function(lo, hi) {
  if ((hi < 0)) {
    var x = ((lo !== 0) ? (~hi) : ((-hi) | 0));
    var jsx$1 = $uD((x >>> 0));
    var x$1 = ((-lo) | 0);
    return (-((4.294967296E9 * jsx$1) + $uD((x$1 >>> 0))))
  } else {
    return ((4.294967296E9 * hi) + $uD((lo >>> 0)))
  }
});
$c_sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  var lo = this.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(value);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I = (function(value) {
  if ((value < (-9.223372036854776E18))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-2147483648);
    return 0
  } else if ((value >= 9.223372036854776E18)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 2147483647;
    return (-1)
  } else {
    var rawLo = $uI((value | 0));
    var x = (value / 4.294967296E9);
    var rawHi = $uI((x | 0));
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (((value < 0) && (rawLo !== 0)) ? (((-1) + rawHi) | 0) : rawHi);
    return rawLo
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$div__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble / bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    var pow = ((31 - $clz32(blo)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((ahi >>> pow) | 0);
    return (((alo >>> pow) | 0) | ((ahi << 1) << ((31 - pow) | 0)))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    var pow$2 = ((31 - $clz32(bhi)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return ((ahi >>> pow$2) | 0)
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 0))
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toString__I__I__T = (function(lo, hi) {
  return ((hi === (lo >> 31)) ? ("" + lo) : ((hi < 0) ? ("-" + this.toUnsignedString__p1__I__I__T(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))) : this.toUnsignedString__p1__I__I__T(lo, hi)))
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo === blo) ? 0 : ((((-2147483648) ^ alo) < ((-2147483648) ^ blo)) ? (-1) : 1)) : ((ahi < bhi) ? (-1) : 1))
});
$c_sjsr_RuntimeLong$.prototype.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar = (function(alo, ahi, blo, bhi, ask) {
  var shift = ((((bhi !== 0) ? $clz32(bhi) : ((32 + $clz32(blo)) | 0)) - ((ahi !== 0) ? $clz32(ahi) : ((32 + $clz32(alo)) | 0))) | 0);
  var n = shift;
  var lo = (((32 & n) === 0) ? (blo << n) : 0);
  var hi = (((32 & n) === 0) ? (((((blo >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (bhi << n)) : (blo << n));
  var bShiftLo = lo;
  var bShiftHi = hi;
  var remLo = alo;
  var remHi = ahi;
  var quotLo = 0;
  var quotHi = 0;
  while (((shift >= 0) && (((-2097152) & remHi) !== 0))) {
    var alo$1 = remLo;
    var ahi$1 = remHi;
    var blo$1 = bShiftLo;
    var bhi$1 = bShiftHi;
    if (((ahi$1 === bhi$1) ? (((-2147483648) ^ alo$1) >= ((-2147483648) ^ blo$1)) : (((-2147483648) ^ ahi$1) >= ((-2147483648) ^ bhi$1)))) {
      var lo$1 = remLo;
      var hi$1 = remHi;
      var lo$2 = bShiftLo;
      var hi$2 = bShiftHi;
      var lo$3 = ((lo$1 - lo$2) | 0);
      var hi$3 = ((((-2147483648) ^ lo$3) > ((-2147483648) ^ lo$1)) ? (((-1) + ((hi$1 - hi$2) | 0)) | 0) : ((hi$1 - hi$2) | 0));
      remLo = lo$3;
      remHi = hi$3;
      if ((shift < 32)) {
        quotLo = (quotLo | (1 << shift))
      } else {
        quotHi = (quotHi | (1 << shift))
      }
    };
    shift = (((-1) + shift) | 0);
    var lo$4 = bShiftLo;
    var hi$4 = bShiftHi;
    var lo$5 = (((lo$4 >>> 1) | 0) | (hi$4 << 31));
    var hi$5 = ((hi$4 >>> 1) | 0);
    bShiftLo = lo$5;
    bShiftHi = hi$5
  };
  var alo$2 = remLo;
  var ahi$2 = remHi;
  if (((ahi$2 === bhi) ? (((-2147483648) ^ alo$2) >= ((-2147483648) ^ blo)) : (((-2147483648) ^ ahi$2) >= ((-2147483648) ^ bhi)))) {
    var lo$6 = remLo;
    var hi$6 = remHi;
    var remDouble = ((4.294967296E9 * hi$6) + $uD((lo$6 >>> 0)));
    var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
    if ((ask !== 1)) {
      var x = (remDouble / bDouble);
      var lo$7 = $uI((x | 0));
      var x$1 = (x / 4.294967296E9);
      var hi$7 = $uI((x$1 | 0));
      var lo$8 = quotLo;
      var hi$8 = quotHi;
      var lo$9 = ((lo$8 + lo$7) | 0);
      var hi$9 = ((((-2147483648) ^ lo$9) < ((-2147483648) ^ lo$8)) ? ((1 + ((hi$8 + hi$7) | 0)) | 0) : ((hi$8 + hi$7) | 0));
      quotLo = lo$9;
      quotHi = hi$9
    };
    if ((ask !== 0)) {
      var rem_mod_bDouble = (remDouble % bDouble);
      remLo = $uI((rem_mod_bDouble | 0));
      var x$2 = (rem_mod_bDouble / 4.294967296E9);
      remHi = $uI((x$2 | 0))
    }
  };
  if ((ask === 0)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = quotHi;
    var a = quotLo;
    return a
  } else if ((ask === 1)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = remHi;
    var a$1 = remLo;
    return a$1
  } else {
    var lo$10 = quotLo;
    var hi$10 = quotHi;
    var quot = ((4.294967296E9 * hi$10) + $uD((lo$10 >>> 0)));
    var this$25 = remLo;
    var remStr = ("" + this$25);
    var a$2 = ((("" + quot) + $as_T("000000000".substring($uI(remStr.length)))) + remStr);
    return a$2
  }
});
$c_sjsr_RuntimeLong$.prototype.remainderImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if ((blo !== (-1))) {
        var lo = ((alo % blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      } else {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return 0
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$percent__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if (neg) {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    } else {
      return absRLo
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$percent__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble % bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return (alo & (((-1) + blo) | 0))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (ahi & (((-1) + bhi) | 0));
    return alo
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 1))
  }
});
var $d_sjsr_RuntimeLong$ = new $TypeData().initClass({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_RuntimeLong$.prototype.$classData = $d_sjsr_RuntimeLong$;
var $n_sjsr_RuntimeLong$ = (void 0);
function $m_sjsr_RuntimeLong$() {
  if ((!$n_sjsr_RuntimeLong$)) {
    $n_sjsr_RuntimeLong$ = new $c_sjsr_RuntimeLong$().init___()
  };
  return $n_sjsr_RuntimeLong$
}
/** @constructor */
function $c_sr_AbstractFunction0() {
  $c_O.call(this)
}
$c_sr_AbstractFunction0.prototype = new $h_O();
$c_sr_AbstractFunction0.prototype.constructor = $c_sr_AbstractFunction0;
/** @constructor */
function $h_sr_AbstractFunction0() {
  /*<skip>*/
}
$h_sr_AbstractFunction0.prototype = $c_sr_AbstractFunction0.prototype;
$c_sr_AbstractFunction0.prototype.toString__T = (function() {
  return "<function0>"
});
/** @constructor */
function $c_sr_AbstractFunction1() {
  $c_O.call(this)
}
$c_sr_AbstractFunction1.prototype = new $h_O();
$c_sr_AbstractFunction1.prototype.constructor = $c_sr_AbstractFunction1;
/** @constructor */
function $h_sr_AbstractFunction1() {
  /*<skip>*/
}
$h_sr_AbstractFunction1.prototype = $c_sr_AbstractFunction1.prototype;
$c_sr_AbstractFunction1.prototype.compose__F1__F1 = (function(g) {
  return $f_F1__compose__F1__F1(this, g)
});
$c_sr_AbstractFunction1.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
function $c_sr_AbstractFunction2() {
  $c_O.call(this)
}
$c_sr_AbstractFunction2.prototype = new $h_O();
$c_sr_AbstractFunction2.prototype.constructor = $c_sr_AbstractFunction2;
/** @constructor */
function $h_sr_AbstractFunction2() {
  /*<skip>*/
}
$h_sr_AbstractFunction2.prototype = $c_sr_AbstractFunction2.prototype;
$c_sr_AbstractFunction2.prototype.toString__T = (function() {
  return "<function2>"
});
/** @constructor */
function $c_sr_AbstractFunction3() {
  $c_O.call(this)
}
$c_sr_AbstractFunction3.prototype = new $h_O();
$c_sr_AbstractFunction3.prototype.constructor = $c_sr_AbstractFunction3;
/** @constructor */
function $h_sr_AbstractFunction3() {
  /*<skip>*/
}
$h_sr_AbstractFunction3.prototype = $c_sr_AbstractFunction3.prototype;
$c_sr_AbstractFunction3.prototype.toString__T = (function() {
  return "<function3>"
});
/** @constructor */
function $c_sr_AbstractFunction4() {
  $c_O.call(this)
}
$c_sr_AbstractFunction4.prototype = new $h_O();
$c_sr_AbstractFunction4.prototype.constructor = $c_sr_AbstractFunction4;
/** @constructor */
function $h_sr_AbstractFunction4() {
  /*<skip>*/
}
$h_sr_AbstractFunction4.prototype = $c_sr_AbstractFunction4.prototype;
$c_sr_AbstractFunction4.prototype.toString__T = (function() {
  return "<function4>"
});
function $isArrayOf_sr_BoxedUnit(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxedUnit)))
}
function $asArrayOf_sr_BoxedUnit(obj, depth) {
  return (($isArrayOf_sr_BoxedUnit(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.runtime.BoxedUnit;", depth))
}
var $d_sr_BoxedUnit = new $TypeData().initClass({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1,
  Ljava_io_Serializable: 1
}, (void 0), (void 0), (function(x) {
  return (x === (void 0))
}));
/** @constructor */
function $c_sr_IntRef() {
  $c_O.call(this);
  this.elem$1 = 0
}
$c_sr_IntRef.prototype = new $h_O();
$c_sr_IntRef.prototype.constructor = $c_sr_IntRef;
/** @constructor */
function $h_sr_IntRef() {
  /*<skip>*/
}
$h_sr_IntRef.prototype = $c_sr_IntRef.prototype;
$c_sr_IntRef.prototype.toString__T = (function() {
  var i = this.elem$1;
  return ("" + i)
});
$c_sr_IntRef.prototype.init___I = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_IntRef = new $TypeData().initClass({
  sr_IntRef: 0
}, false, "scala.runtime.IntRef", {
  sr_IntRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_IntRef.prototype.$classData = $d_sr_IntRef;
/** @constructor */
function $c_sr_ObjectRef() {
  $c_O.call(this);
  this.elem$1 = null
}
$c_sr_ObjectRef.prototype = new $h_O();
$c_sr_ObjectRef.prototype.constructor = $c_sr_ObjectRef;
/** @constructor */
function $h_sr_ObjectRef() {
  /*<skip>*/
}
$h_sr_ObjectRef.prototype = $c_sr_ObjectRef.prototype;
$c_sr_ObjectRef.prototype.toString__T = (function() {
  var obj = this.elem$1;
  return ("" + obj)
});
$c_sr_ObjectRef.prototype.init___O = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_ObjectRef = new $TypeData().initClass({
  sr_ObjectRef: 0
}, false, "scala.runtime.ObjectRef", {
  sr_ObjectRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_ObjectRef.prototype.$classData = $d_sr_ObjectRef;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr$Event() {
  $c_Ljapgolly_scalajs_react_vdom_Attr$Generic.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype = new $h_Ljapgolly_scalajs_react_vdom_Attr$Generic();
$c_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr$Event;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr$Event() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype.init___T = (function(name) {
  $c_Ljapgolly_scalajs_react_vdom_Attr.prototype.init___T.call(this, name);
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Attr$Event = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr$Event: 0
}, false, "japgolly.scalajs.react.vdom.Attr$Event", {
  Ljapgolly_scalajs_react_vdom_Attr$Event: 1,
  Ljapgolly_scalajs_react_vdom_Attr$Generic: 1,
  Ljapgolly_scalajs_react_vdom_Attr: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr$Event;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement() {
  $c_O.call(this);
  this.props$1 = null;
  this.styles$1 = null;
  this.children$1 = null;
  this.key$1 = null;
  this.nonEmptyClassName$1 = null;
  this.addAttr$1 = null;
  this.addClassName$1 = null;
  this.addStyle$1 = null;
  this.addStylesObject$1 = null;
  this.appendChild$1 = null;
  this.setKey$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement.prototype = $c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement.prototype;
$c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement.prototype.init___ = (function() {
  $f_Ljapgolly_scalajs_react_vdom_Builder$ToJs__$$init$__V(this);
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement.prototype.render__T__Ljapgolly_scalajs_react_raw_React$Element = (function(tag) {
  $f_Ljapgolly_scalajs_react_vdom_Builder$ToJs__addClassNameToProps__V(this);
  $f_Ljapgolly_scalajs_react_vdom_Builder$ToJs__addStyleToProps__V(this);
  return $m_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement$().build$1.apply__O__O__O__O__O(tag, this.props$1, this.key$1, this.children$1)
});
var $d_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement: 0
}, false, "japgolly.scalajs.react.vdom.Builder$ToRawReactElement", {
  Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_Builder$ToJs: 1,
  Ljapgolly_scalajs_react_vdom_Builder: 1
});
$c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1() {
  $c_O.call(this);
  this.n$1$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1.prototype = $c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1.prototype.rawNode__sjs_js_$bar = (function() {
  return this.n$1$1
});
$c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  b.appendChild$1.apply__O__O(this.n$1$1)
});
$c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1.prototype.init___sjs_js_$bar = (function(n$1) {
  this.n$1$1 = n$1;
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1: 0
}, false, "japgolly.scalajs.react.vdom.VdomNode$$anon$1", {
  Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_VdomNode: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_VdomNode$$anon$1;
var $d_jl_Boolean = new $TypeData().initClass({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
function $c_jl_Character() {
  $c_O.call(this);
  this.value$1 = 0
}
$c_jl_Character.prototype = new $h_O();
$c_jl_Character.prototype.constructor = $c_jl_Character;
/** @constructor */
function $h_jl_Character() {
  /*<skip>*/
}
$h_jl_Character.prototype = $c_jl_Character.prototype;
$c_jl_Character.prototype.equals__O__Z = (function(that) {
  if ((that instanceof $c_jl_Character)) {
    var jsx$1 = this.value$1;
    var this$1 = $as_jl_Character(that);
    return (jsx$1 === this$1.value$1)
  } else {
    return false
  }
});
$c_jl_Character.prototype.toString__T = (function() {
  var c = this.value$1;
  return $as_T($g.String.fromCharCode(c))
});
$c_jl_Character.prototype.init___C = (function(value) {
  this.value$1 = value;
  return this
});
$c_jl_Character.prototype.hashCode__I = (function() {
  return this.value$1
});
function $as_jl_Character(obj) {
  return (((obj instanceof $c_jl_Character) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Character"))
}
function $isArrayOf_jl_Character(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)))
}
function $asArrayOf_jl_Character(obj, depth) {
  return (($isArrayOf_jl_Character(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Character;", depth))
}
var $d_jl_Character = new $TypeData().initClass({
  jl_Character: 0
}, false, "java.lang.Character", {
  jl_Character: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_jl_Character.prototype.$classData = $d_jl_Character;
/** @constructor */
function $c_jl_Error() {
  $c_jl_Throwable.call(this)
}
$c_jl_Error.prototype = new $h_jl_Throwable();
$c_jl_Error.prototype.constructor = $c_jl_Error;
/** @constructor */
function $h_jl_Error() {
  /*<skip>*/
}
$h_jl_Error.prototype = $c_jl_Error.prototype;
/** @constructor */
function $c_jl_Exception() {
  $c_jl_Throwable.call(this)
}
$c_jl_Exception.prototype = new $h_jl_Throwable();
$c_jl_Exception.prototype.constructor = $c_jl_Exception;
/** @constructor */
function $h_jl_Exception() {
  /*<skip>*/
}
$h_jl_Exception.prototype = $c_jl_Exception.prototype;
$c_jl_Exception.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_Exception = new $TypeData().initClass({
  jl_Exception: 0
}, false, "java.lang.Exception", {
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Exception.prototype.$classData = $d_jl_Exception;
/** @constructor */
function $c_ju_AbstractCollection() {
  $c_O.call(this)
}
$c_ju_AbstractCollection.prototype = new $h_O();
$c_ju_AbstractCollection.prototype.constructor = $c_ju_AbstractCollection;
/** @constructor */
function $h_ju_AbstractCollection() {
  /*<skip>*/
}
$h_ju_AbstractCollection.prototype = $c_ju_AbstractCollection.prototype;
$c_ju_AbstractCollection.prototype.containsAll__ju_Collection__Z = (function(c) {
  var __self = c.iterator__ju_Iterator();
  inlinereturn$6: {
    while (__self.hasNext__Z()) {
      var arg1 = __self.next__O();
      if ((!this.contains__O__Z(arg1))) {
        var jsx$1 = true;
        break inlinereturn$6
      }
    };
    var jsx$1 = false
  };
  return (!jsx$1)
});
$c_ju_AbstractCollection.prototype.toString__T = (function() {
  var __self = this.iterator__ju_Iterator();
  var result = "[";
  var first = true;
  while (__self.hasNext__Z()) {
    if (first) {
      first = false
    } else {
      result = (result + ", ")
    };
    result = (("" + result) + __self.next__O())
  };
  return (result + "]")
});
/** @constructor */
function $c_ju_HashMap$NodeIterator() {
  $c_ju_HashMap$AbstractHashMapIterator.call(this)
}
$c_ju_HashMap$NodeIterator.prototype = new $h_ju_HashMap$AbstractHashMapIterator();
$c_ju_HashMap$NodeIterator.prototype.constructor = $c_ju_HashMap$NodeIterator;
/** @constructor */
function $h_ju_HashMap$NodeIterator() {
  /*<skip>*/
}
$h_ju_HashMap$NodeIterator.prototype = $c_ju_HashMap$NodeIterator.prototype;
$c_ju_HashMap$NodeIterator.prototype.init___ju_HashMap = (function($$outer) {
  $c_ju_HashMap$AbstractHashMapIterator.prototype.init___ju_HashMap.call(this, $$outer);
  return this
});
var $d_ju_HashMap$NodeIterator = new $TypeData().initClass({
  ju_HashMap$NodeIterator: 0
}, false, "java.util.HashMap$NodeIterator", {
  ju_HashMap$NodeIterator: 1,
  ju_HashMap$AbstractHashMapIterator: 1,
  O: 1,
  ju_Iterator: 1
});
$c_ju_HashMap$NodeIterator.prototype.$classData = $d_ju_HashMap$NodeIterator;
/** @constructor */
function $c_s_$less$colon$less() {
  $c_O.call(this)
}
$c_s_$less$colon$less.prototype = new $h_O();
$c_s_$less$colon$less.prototype.constructor = $c_s_$less$colon$less;
/** @constructor */
function $h_s_$less$colon$less() {
  /*<skip>*/
}
$h_s_$less$colon$less.prototype = $c_s_$less$colon$less.prototype;
/** @constructor */
function $c_s_math_Equiv$() {
  $c_O.call(this)
}
$c_s_math_Equiv$.prototype = new $h_O();
$c_s_math_Equiv$.prototype.constructor = $c_s_math_Equiv$;
/** @constructor */
function $h_s_math_Equiv$() {
  /*<skip>*/
}
$h_s_math_Equiv$.prototype = $c_s_math_Equiv$.prototype;
$c_s_math_Equiv$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Equiv$ = new $TypeData().initClass({
  s_math_Equiv$: 0
}, false, "scala.math.Equiv$", {
  s_math_Equiv$: 1,
  O: 1,
  s_math_LowPriorityEquiv: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Equiv$.prototype.$classData = $d_s_math_Equiv$;
var $n_s_math_Equiv$ = (void 0);
function $m_s_math_Equiv$() {
  if ((!$n_s_math_Equiv$)) {
    $n_s_math_Equiv$ = new $c_s_math_Equiv$().init___()
  };
  return $n_s_math_Equiv$
}
/** @constructor */
function $c_s_math_Ordering$() {
  $c_O.call(this)
}
$c_s_math_Ordering$.prototype = new $h_O();
$c_s_math_Ordering$.prototype.constructor = $c_s_math_Ordering$;
/** @constructor */
function $h_s_math_Ordering$() {
  /*<skip>*/
}
$h_s_math_Ordering$.prototype = $c_s_math_Ordering$.prototype;
$c_s_math_Ordering$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordering$ = new $TypeData().initClass({
  s_math_Ordering$: 0
}, false, "scala.math.Ordering$", {
  s_math_Ordering$: 1,
  O: 1,
  s_math_LowPriorityOrderingImplicits: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Ordering$.prototype.$classData = $d_s_math_Ordering$;
var $n_s_math_Ordering$ = (void 0);
function $m_s_math_Ordering$() {
  if ((!$n_s_math_Ordering$)) {
    $n_s_math_Ordering$ = new $c_s_math_Ordering$().init___()
  };
  return $n_s_math_Ordering$
}
/** @constructor */
function $c_s_math_ScalaNumber() {
  /*<skip>*/
}
function $as_s_math_ScalaNumber(obj) {
  return (((obj instanceof $c_s_math_ScalaNumber) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.math.ScalaNumber"))
}
function $isArrayOf_s_math_ScalaNumber(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)))
}
function $asArrayOf_s_math_ScalaNumber(obj, depth) {
  return (($isArrayOf_s_math_ScalaNumber(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.math.ScalaNumber;", depth))
}
/** @constructor */
function $c_sc_IterableFactory$Delegate() {
  $c_O.call(this);
  this.delegate$1 = null
}
$c_sc_IterableFactory$Delegate.prototype = new $h_O();
$c_sc_IterableFactory$Delegate.prototype.constructor = $c_sc_IterableFactory$Delegate;
/** @constructor */
function $h_sc_IterableFactory$Delegate() {
  /*<skip>*/
}
$h_sc_IterableFactory$Delegate.prototype = $c_sc_IterableFactory$Delegate.prototype;
$c_sc_IterableFactory$Delegate.prototype.init___sc_IterableFactory = (function(delegate) {
  this.delegate$1 = delegate;
  return this
});
$c_sc_IterableFactory$Delegate.prototype.from__sc_IterableOnce__O = (function(it) {
  return this.delegate$1.from__sc_IterableOnce__O(it)
});
/** @constructor */
function $c_sc_IterableOps$WithFilter() {
  $c_sc_WithFilter.call(this);
  this.self$2 = null;
  this.p$2 = null
}
$c_sc_IterableOps$WithFilter.prototype = new $h_sc_WithFilter();
$c_sc_IterableOps$WithFilter.prototype.constructor = $c_sc_IterableOps$WithFilter;
/** @constructor */
function $h_sc_IterableOps$WithFilter() {
  /*<skip>*/
}
$h_sc_IterableOps$WithFilter.prototype = $c_sc_IterableOps$WithFilter.prototype;
$c_sc_IterableOps$WithFilter.prototype.init___sc_IterableOps__F1 = (function(self, p) {
  this.self$2 = self;
  this.p$2 = p;
  return this
});
$c_sc_IterableOps$WithFilter.prototype.filtered__sc_Iterable = (function() {
  return new $c_sc_View$Filter().init___sc_IterableOps__F1__Z(this.self$2, this.p$2, false)
});
/** @constructor */
function $c_sc_Iterator$() {
  $c_O.call(this);
  this.scala$collection$Iterator$$$undempty$f = null
}
$c_sc_Iterator$.prototype = new $h_O();
$c_sc_Iterator$.prototype.constructor = $c_sc_Iterator$;
/** @constructor */
function $h_sc_Iterator$() {
  /*<skip>*/
}
$h_sc_Iterator$.prototype = $c_sc_Iterator$.prototype;
$c_sc_Iterator$.prototype.init___ = (function() {
  $n_sc_Iterator$ = this;
  this.scala$collection$Iterator$$$undempty$f = new $c_sc_Iterator$$anon$19().init___();
  return this
});
$c_sc_Iterator$.prototype.from__sc_IterableOnce__O = (function(source) {
  return source.iterator__sc_Iterator()
});
var $d_sc_Iterator$ = new $TypeData().initClass({
  sc_Iterator$: 0
}, false, "scala.collection.Iterator$", {
  sc_Iterator$: 1,
  O: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sc_Iterator$.prototype.$classData = $d_sc_Iterator$;
var $n_sc_Iterator$ = (void 0);
function $m_sc_Iterator$() {
  if ((!$n_sc_Iterator$)) {
    $n_sc_Iterator$ = new $c_sc_Iterator$().init___()
  };
  return $n_sc_Iterator$
}
/** @constructor */
function $c_sc_MapFactory$Delegate() {
  $c_O.call(this);
  this.delegate$1 = null
}
$c_sc_MapFactory$Delegate.prototype = new $h_O();
$c_sc_MapFactory$Delegate.prototype.constructor = $c_sc_MapFactory$Delegate;
/** @constructor */
function $h_sc_MapFactory$Delegate() {
  /*<skip>*/
}
$h_sc_MapFactory$Delegate.prototype = $c_sc_MapFactory$Delegate.prototype;
$c_sc_MapFactory$Delegate.prototype.init___sc_MapFactory = (function(delegate) {
  this.delegate$1 = delegate;
  return this
});
function $f_sc_SeqOps__isEmpty__Z($thiz) {
  return ($thiz.lengthCompare__I__I(0) === 0)
}
function $f_sc_SeqOps__sameElements__sc_IterableOnce__Z($thiz, that) {
  var thisKnownSize = $thiz.knownSize__I();
  if ((thisKnownSize !== (-1))) {
    var thatKnownSize = that.knownSize__I();
    var knownSizeDifference = ((thatKnownSize !== (-1)) && (thisKnownSize !== thatKnownSize))
  } else {
    var knownSizeDifference = false
  };
  if ((!knownSizeDifference)) {
    var this$1 = $thiz.iterator__sc_Iterator();
    return $f_sc_Iterator__sameElements__sc_IterableOnce__Z(this$1, that)
  } else {
    return false
  }
}
function $f_sc_SeqOps__prependedAll__sc_IterableOnce__O($thiz, prefix) {
  var jsx$2 = $thiz.iterableFactory__sc_IterableFactory();
  if ($is_sc_Iterable(prefix)) {
    var x2 = $as_sc_Iterable(prefix);
    var jsx$1 = new $c_sc_View$Concat().init___sc_IterableOps__sc_IterableOps(x2, $thiz)
  } else {
    var this$1 = prefix.iterator__sc_Iterator();
    var xs = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
      return (function() {
        return $this.iterator__sc_Iterator()
      })
    })($thiz));
    var jsx$1 = this$1.concat__F0__sc_Iterator(xs)
  };
  return jsx$2.from__sc_IterableOnce__O(jsx$1)
}
function $is_sc_SeqOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_SeqOps)))
}
function $as_sc_SeqOps(obj) {
  return (($is_sc_SeqOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.SeqOps"))
}
function $isArrayOf_sc_SeqOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_SeqOps)))
}
function $asArrayOf_sc_SeqOps(obj, depth) {
  return (($isArrayOf_sc_SeqOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.SeqOps;", depth))
}
/** @constructor */
function $c_sc_View$() {
  $c_O.call(this)
}
$c_sc_View$.prototype = new $h_O();
$c_sc_View$.prototype.constructor = $c_sc_View$;
/** @constructor */
function $h_sc_View$() {
  /*<skip>*/
}
$h_sc_View$.prototype = $c_sc_View$.prototype;
$c_sc_View$.prototype.init___ = (function() {
  return this
});
$c_sc_View$.prototype.from__sc_IterableOnce__sc_View = (function(it) {
  if ($is_sc_View(it)) {
    var x2 = $as_sc_View(it);
    return x2
  } else if ($is_sc_Iterable(it)) {
    var x3 = $as_sc_Iterable(it);
    var it$1 = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, x3$1) {
      return (function() {
        return x3$1.iterator__sc_Iterator()
      })
    })(this, x3));
    return new $c_sc_View$$anon$1().init___F0(it$1)
  } else {
    var this$2 = $m_sci_LazyList$().from__sc_IterableOnce__sci_LazyList(it);
    return new $c_sc_SeqView$Id().init___sc_SeqOps(this$2)
  }
});
$c_sc_View$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sc_View(source)
});
var $d_sc_View$ = new $TypeData().initClass({
  sc_View$: 0
}, false, "scala.collection.View$", {
  sc_View$: 1,
  O: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sc_View$.prototype.$classData = $d_sc_View$;
var $n_sc_View$ = (void 0);
function $m_sc_View$() {
  if ((!$n_sc_View$)) {
    $n_sc_View$ = new $c_sc_View$().init___()
  };
  return $n_sc_View$
}
/** @constructor */
function $c_sci_LazyList$State$Cons() {
  $c_O.call(this);
  this.head$1 = null;
  this.tail$1 = null
}
$c_sci_LazyList$State$Cons.prototype = new $h_O();
$c_sci_LazyList$State$Cons.prototype.constructor = $c_sci_LazyList$State$Cons;
/** @constructor */
function $h_sci_LazyList$State$Cons() {
  /*<skip>*/
}
$h_sci_LazyList$State$Cons.prototype = $c_sci_LazyList$State$Cons.prototype;
$c_sci_LazyList$State$Cons.prototype.tail__sci_LazyList = (function() {
  return this.tail$1
});
$c_sci_LazyList$State$Cons.prototype.head__O = (function() {
  return this.head$1
});
$c_sci_LazyList$State$Cons.prototype.init___O__sci_LazyList = (function(head, tail) {
  this.head$1 = head;
  this.tail$1 = tail;
  return this
});
var $d_sci_LazyList$State$Cons = new $TypeData().initClass({
  sci_LazyList$State$Cons: 0
}, false, "scala.collection.immutable.LazyList$State$Cons", {
  sci_LazyList$State$Cons: 1,
  O: 1,
  sci_LazyList$State: 1,
  Ljava_io_Serializable: 1
});
$c_sci_LazyList$State$Cons.prototype.$classData = $d_sci_LazyList$State$Cons;
/** @constructor */
function $c_sci_LazyList$State$Empty$() {
  $c_O.call(this)
}
$c_sci_LazyList$State$Empty$.prototype = new $h_O();
$c_sci_LazyList$State$Empty$.prototype.constructor = $c_sci_LazyList$State$Empty$;
/** @constructor */
function $h_sci_LazyList$State$Empty$() {
  /*<skip>*/
}
$h_sci_LazyList$State$Empty$.prototype = $c_sci_LazyList$State$Empty$.prototype;
$c_sci_LazyList$State$Empty$.prototype.init___ = (function() {
  return this
});
$c_sci_LazyList$State$Empty$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_LazyList$State$Empty$.prototype.tail__sci_LazyList = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty lazy list")
});
$c_sci_LazyList$State$Empty$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty lazy list")
});
var $d_sci_LazyList$State$Empty$ = new $TypeData().initClass({
  sci_LazyList$State$Empty$: 0
}, false, "scala.collection.immutable.LazyList$State$Empty$", {
  sci_LazyList$State$Empty$: 1,
  O: 1,
  sci_LazyList$State: 1,
  Ljava_io_Serializable: 1
});
$c_sci_LazyList$State$Empty$.prototype.$classData = $d_sci_LazyList$State$Empty$;
var $n_sci_LazyList$State$Empty$ = (void 0);
function $m_sci_LazyList$State$Empty$() {
  if ((!$n_sci_LazyList$State$Empty$)) {
    $n_sci_LazyList$State$Empty$ = new $c_sci_LazyList$State$Empty$().init___()
  };
  return $n_sci_LazyList$State$Empty$
}
/** @constructor */
function $c_sci_Map$() {
  $c_O.call(this)
}
$c_sci_Map$.prototype = new $h_O();
$c_sci_Map$.prototype.constructor = $c_sci_Map$;
/** @constructor */
function $h_sci_Map$() {
  /*<skip>*/
}
$h_sci_Map$.prototype = $c_sci_Map$.prototype;
$c_sci_Map$.prototype.init___ = (function() {
  return this
});
var $d_sci_Map$ = new $TypeData().initClass({
  sci_Map$: 0
}, false, "scala.collection.immutable.Map$", {
  sci_Map$: 1,
  O: 1,
  sc_MapFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$.prototype.$classData = $d_sci_Map$;
var $n_sci_Map$ = (void 0);
function $m_sci_Map$() {
  if ((!$n_sci_Map$)) {
    $n_sci_Map$ = new $c_sci_Map$().init___()
  };
  return $n_sci_Map$
}
/** @constructor */
function $c_sjsr_AnonFunction0() {
  $c_sr_AbstractFunction0.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction0.prototype = new $h_sr_AbstractFunction0();
$c_sjsr_AnonFunction0.prototype.constructor = $c_sjsr_AnonFunction0;
/** @constructor */
function $h_sjsr_AnonFunction0() {
  /*<skip>*/
}
$h_sjsr_AnonFunction0.prototype = $c_sjsr_AnonFunction0.prototype;
$c_sjsr_AnonFunction0.prototype.apply__O = (function() {
  return (0, this.f$2)()
});
$c_sjsr_AnonFunction0.prototype.init___sjs_js_Function0 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction0 = new $TypeData().initClass({
  sjsr_AnonFunction0: 0
}, false, "scala.scalajs.runtime.AnonFunction0", {
  sjsr_AnonFunction0: 1,
  sr_AbstractFunction0: 1,
  O: 1,
  F0: 1
});
$c_sjsr_AnonFunction0.prototype.$classData = $d_sjsr_AnonFunction0;
/** @constructor */
function $c_sjsr_AnonFunction1() {
  $c_sr_AbstractFunction1.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction1.prototype = new $h_sr_AbstractFunction1();
$c_sjsr_AnonFunction1.prototype.constructor = $c_sjsr_AnonFunction1;
/** @constructor */
function $h_sjsr_AnonFunction1() {
  /*<skip>*/
}
$h_sjsr_AnonFunction1.prototype = $c_sjsr_AnonFunction1.prototype;
$c_sjsr_AnonFunction1.prototype.apply__O__O = (function(arg1) {
  return (0, this.f$2)(arg1)
});
$c_sjsr_AnonFunction1.prototype.init___sjs_js_Function1 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction1 = new $TypeData().initClass({
  sjsr_AnonFunction1: 0
}, false, "scala.scalajs.runtime.AnonFunction1", {
  sjsr_AnonFunction1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
$c_sjsr_AnonFunction1.prototype.$classData = $d_sjsr_AnonFunction1;
/** @constructor */
function $c_sjsr_AnonFunction2() {
  $c_sr_AbstractFunction2.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction2.prototype = new $h_sr_AbstractFunction2();
$c_sjsr_AnonFunction2.prototype.constructor = $c_sjsr_AnonFunction2;
/** @constructor */
function $h_sjsr_AnonFunction2() {
  /*<skip>*/
}
$h_sjsr_AnonFunction2.prototype = $c_sjsr_AnonFunction2.prototype;
$c_sjsr_AnonFunction2.prototype.init___sjs_js_Function2 = (function(f) {
  this.f$2 = f;
  return this
});
$c_sjsr_AnonFunction2.prototype.apply__O__O__O = (function(arg1, arg2) {
  return (0, this.f$2)(arg1, arg2)
});
var $d_sjsr_AnonFunction2 = new $TypeData().initClass({
  sjsr_AnonFunction2: 0
}, false, "scala.scalajs.runtime.AnonFunction2", {
  sjsr_AnonFunction2: 1,
  sr_AbstractFunction2: 1,
  O: 1,
  F2: 1
});
$c_sjsr_AnonFunction2.prototype.$classData = $d_sjsr_AnonFunction2;
/** @constructor */
function $c_sjsr_AnonFunction3() {
  $c_sr_AbstractFunction3.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction3.prototype = new $h_sr_AbstractFunction3();
$c_sjsr_AnonFunction3.prototype.constructor = $c_sjsr_AnonFunction3;
/** @constructor */
function $h_sjsr_AnonFunction3() {
  /*<skip>*/
}
$h_sjsr_AnonFunction3.prototype = $c_sjsr_AnonFunction3.prototype;
$c_sjsr_AnonFunction3.prototype.init___sjs_js_Function3 = (function(f) {
  this.f$2 = f;
  return this
});
$c_sjsr_AnonFunction3.prototype.apply__O__O__O__O = (function(arg1, arg2, arg3) {
  return (0, this.f$2)(arg1, arg2, arg3)
});
var $d_sjsr_AnonFunction3 = new $TypeData().initClass({
  sjsr_AnonFunction3: 0
}, false, "scala.scalajs.runtime.AnonFunction3", {
  sjsr_AnonFunction3: 1,
  sr_AbstractFunction3: 1,
  O: 1,
  F3: 1
});
$c_sjsr_AnonFunction3.prototype.$classData = $d_sjsr_AnonFunction3;
/** @constructor */
function $c_sjsr_AnonFunction4() {
  $c_sr_AbstractFunction4.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction4.prototype = new $h_sr_AbstractFunction4();
$c_sjsr_AnonFunction4.prototype.constructor = $c_sjsr_AnonFunction4;
/** @constructor */
function $h_sjsr_AnonFunction4() {
  /*<skip>*/
}
$h_sjsr_AnonFunction4.prototype = $c_sjsr_AnonFunction4.prototype;
$c_sjsr_AnonFunction4.prototype.apply__O__O__O__O__O = (function(arg1, arg2, arg3, arg4) {
  return (0, this.f$2)(arg1, arg2, arg3, arg4)
});
$c_sjsr_AnonFunction4.prototype.init___sjs_js_Function4 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction4 = new $TypeData().initClass({
  sjsr_AnonFunction4: 0
}, false, "scala.scalajs.runtime.AnonFunction4", {
  sjsr_AnonFunction4: 1,
  sr_AbstractFunction4: 1,
  O: 1,
  F4: 1
});
$c_sjsr_AnonFunction4.prototype.$classData = $d_sjsr_AnonFunction4;
var $d_sr_Nothing$ = new $TypeData().initClass({
  sr_Nothing$: 0
}, false, "scala.runtime.Nothing$", {
  sr_Nothing$: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$Mod() {
  $c_O.call(this);
  this.mod$1 = null
}
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$Mod;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$Mod() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$Mod.prototype = $c_Ljapgolly_scalajs_react_CtorType$Mod.prototype;
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.productPrefix__T = (function() {
  return "Mod"
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.equals__O__Z = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_CtorType$Mod$().equals$extension__F1__O__Z(this.mod$1, x$1)
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.productElement__I__O = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_CtorType$Mod$().productElement$extension__F1__I__O(this.mod$1, x$1)
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_CtorType$Mod$().toString$extension__F1__T(this.mod$1)
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.init___F1 = (function(mod) {
  this.mod$1 = mod;
  return this
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.hashCode__I = (function() {
  var $$this = this.mod$1;
  return $$this.hashCode__I()
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.productIterator__sc_Iterator = (function() {
  return $m_Ljapgolly_scalajs_react_CtorType$Mod$().productIterator$extension__F1__sc_Iterator(this.mod$1)
});
function $as_Ljapgolly_scalajs_react_CtorType$Mod(obj) {
  return (((obj instanceof $c_Ljapgolly_scalajs_react_CtorType$Mod) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.CtorType$Mod"))
}
function $isArrayOf_Ljapgolly_scalajs_react_CtorType$Mod(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_CtorType$Mod)))
}
function $asArrayOf_Ljapgolly_scalajs_react_CtorType$Mod(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_CtorType$Mod(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.CtorType$Mod;", depth))
}
var $d_Ljapgolly_scalajs_react_CtorType$Mod = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$Mod: 0
}, false, "japgolly.scalajs.react.CtorType$Mod", {
  Ljapgolly_scalajs_react_CtorType$Mod: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$Mod;
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$Mod$() {
  $c_sr_AbstractFunction1.call(this)
}
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype = new $h_sr_AbstractFunction1();
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$Mod$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$Mod$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$Mod$.prototype = $c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype;
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.productElement$extension__F1__I__O = (function($$this, x$1) {
  switch (x$1) {
    case 0: {
      return $$this;
      break
    }
    default: {
      return $m_sr_Statics$().ioobe__I__O(x$1)
    }
  }
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.apply__O__O = (function(v1) {
  var mod = $as_F1(v1);
  return new $c_Ljapgolly_scalajs_react_CtorType$Mod().init___F1(mod)
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.productIterator$extension__F1__sc_Iterator = (function($$this) {
  var x = new $c_Ljapgolly_scalajs_react_CtorType$Mod().init___F1($$this);
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(x)
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.toString__T = (function() {
  return "Mod"
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.toString$extension__F1__T = (function($$this) {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(new $c_Ljapgolly_scalajs_react_CtorType$Mod().init___F1($$this))
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.applyAndCast$extension__F1__sjs_js_Object__sjs_js_Object = (function($$this, o) {
  $$this.apply__O__O(o);
  return o
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.equals$extension__F1__O__Z = (function($$this, x$1) {
  if ((x$1 instanceof $c_Ljapgolly_scalajs_react_CtorType$Mod)) {
    var Mod$1 = ((x$1 === null) ? null : $as_Ljapgolly_scalajs_react_CtorType$Mod(x$1).mod$1);
    return (($$this === null) ? (Mod$1 === null) : $$this.equals__O__Z(Mod$1))
  } else {
    return false
  }
});
var $d_Ljapgolly_scalajs_react_CtorType$Mod$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$Mod$: 0
}, false, "japgolly.scalajs.react.CtorType$Mod$", {
  Ljapgolly_scalajs_react_CtorType$Mod$: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$Mod$;
var $n_Ljapgolly_scalajs_react_CtorType$Mod$ = (void 0);
function $m_Ljapgolly_scalajs_react_CtorType$Mod$() {
  if ((!$n_Ljapgolly_scalajs_react_CtorType$Mod$)) {
    $n_Ljapgolly_scalajs_react_CtorType$Mod$ = new $c_Ljapgolly_scalajs_react_CtorType$Mod$().init___()
  };
  return $n_Ljapgolly_scalajs_react_CtorType$Mod$
}
function $is_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot)))
}
function $as_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj) {
  return (($is_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.Js$UnmountedWithRoot"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.Js$UnmountedWithRoot;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle() {
  $c_O.call(this);
  this.componentDidCatch$1 = null;
  this.componentDidMount$1 = null;
  this.componentDidUpdate$1 = null;
  this.componentWillMount$1 = null;
  this.componentWillReceiveProps$1 = null;
  this.componentWillUnmount$1 = null;
  this.componentWillUpdate$1 = null;
  this.getDerivedStateFromProps$1 = null;
  this.getSnapshotBeforeUpdate$1 = null;
  this.shouldComponentUpdate$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype.productPrefix__T = (function() {
  return "Lifecycle"
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype.productArity__I = (function() {
  return 10
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ((x$1 instanceof $c_Ljapgolly_scalajs_react_component_builder_Lifecycle)) {
    var Lifecycle$1 = $as_Ljapgolly_scalajs_react_component_builder_Lifecycle(x$1);
    var x = this.componentDidCatch$1;
    var x$2 = Lifecycle$1.componentDidCatch$1;
    if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
      var x$3 = this.componentDidMount$1;
      var x$4 = Lifecycle$1.componentDidMount$1;
      var jsx$8 = ((x$3 === null) ? (x$4 === null) : x$3.equals__O__Z(x$4))
    } else {
      var jsx$8 = false
    };
    if (jsx$8) {
      var x$5 = this.componentDidUpdate$1;
      var x$6 = Lifecycle$1.componentDidUpdate$1;
      var jsx$7 = ((x$5 === null) ? (x$6 === null) : x$5.equals__O__Z(x$6))
    } else {
      var jsx$7 = false
    };
    if (jsx$7) {
      var x$7 = this.componentWillMount$1;
      var x$8 = Lifecycle$1.componentWillMount$1;
      var jsx$6 = ((x$7 === null) ? (x$8 === null) : x$7.equals__O__Z(x$8))
    } else {
      var jsx$6 = false
    };
    if (jsx$6) {
      var x$9 = this.componentWillReceiveProps$1;
      var x$10 = Lifecycle$1.componentWillReceiveProps$1;
      var jsx$5 = ((x$9 === null) ? (x$10 === null) : x$9.equals__O__Z(x$10))
    } else {
      var jsx$5 = false
    };
    if (jsx$5) {
      var x$11 = this.componentWillUnmount$1;
      var x$12 = Lifecycle$1.componentWillUnmount$1;
      var jsx$4 = ((x$11 === null) ? (x$12 === null) : x$11.equals__O__Z(x$12))
    } else {
      var jsx$4 = false
    };
    if (jsx$4) {
      var x$13 = this.componentWillUpdate$1;
      var x$14 = Lifecycle$1.componentWillUpdate$1;
      var jsx$3 = ((x$13 === null) ? (x$14 === null) : x$13.equals__O__Z(x$14))
    } else {
      var jsx$3 = false
    };
    if (jsx$3) {
      var x$15 = this.getDerivedStateFromProps$1;
      var x$16 = Lifecycle$1.getDerivedStateFromProps$1;
      var jsx$2 = ((x$15 === null) ? (x$16 === null) : x$15.equals__O__Z(x$16))
    } else {
      var jsx$2 = false
    };
    if (jsx$2) {
      var x$17 = this.getSnapshotBeforeUpdate$1;
      var x$18 = Lifecycle$1.getSnapshotBeforeUpdate$1;
      var jsx$1 = ((x$17 === null) ? (x$18 === null) : x$17.equals__O__Z(x$18))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var x$19 = this.shouldComponentUpdate$1;
      var x$20 = Lifecycle$1.shouldComponentUpdate$1;
      return ((x$19 === null) ? (x$20 === null) : x$19.equals__O__Z(x$20))
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype.init___s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option = (function(componentDidCatch, componentDidMount, componentDidUpdate, componentWillMount, componentWillReceiveProps, componentWillUnmount, componentWillUpdate, getDerivedStateFromProps, getSnapshotBeforeUpdate, shouldComponentUpdate) {
  this.componentDidCatch$1 = componentDidCatch;
  this.componentDidMount$1 = componentDidMount;
  this.componentDidUpdate$1 = componentDidUpdate;
  this.componentWillMount$1 = componentWillMount;
  this.componentWillReceiveProps$1 = componentWillReceiveProps;
  this.componentWillUnmount$1 = componentWillUnmount;
  this.componentWillUpdate$1 = componentWillUpdate;
  this.getDerivedStateFromProps$1 = getDerivedStateFromProps;
  this.getSnapshotBeforeUpdate$1 = getSnapshotBeforeUpdate;
  this.shouldComponentUpdate$1 = shouldComponentUpdate;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.componentDidCatch$1;
      break
    }
    case 1: {
      return this.componentDidMount$1;
      break
    }
    case 2: {
      return this.componentDidUpdate$1;
      break
    }
    case 3: {
      return this.componentWillMount$1;
      break
    }
    case 4: {
      return this.componentWillReceiveProps$1;
      break
    }
    case 5: {
      return this.componentWillUnmount$1;
      break
    }
    case 6: {
      return this.componentWillUpdate$1;
      break
    }
    case 7: {
      return this.getDerivedStateFromProps$1;
      break
    }
    case 8: {
      return this.getSnapshotBeforeUpdate$1;
      break
    }
    case 9: {
      return this.shouldComponentUpdate$1;
      break
    }
    default: {
      return $m_sr_Statics$().ioobe__I__O(x$1)
    }
  }
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__Z__I(this, (-889275714), false)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $as_Ljapgolly_scalajs_react_component_builder_Lifecycle(obj) {
  return (((obj instanceof $c_Ljapgolly_scalajs_react_component_builder_Lifecycle) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.builder.Lifecycle"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_builder_Lifecycle)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.builder.Lifecycle;", depth))
}
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_JsRepr$() {
  $c_O.call(this);
  this.unit$1 = null
}
$c_Ljapgolly_scalajs_react_internal_JsRepr$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_JsRepr$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_JsRepr$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_JsRepr$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_JsRepr$.prototype = $c_Ljapgolly_scalajs_react_internal_JsRepr$.prototype;
$c_Ljapgolly_scalajs_react_internal_JsRepr$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_JsRepr$ = this;
  $f_Ljapgolly_scalajs_react_internal_JsReprHighPri__$$init$__V(this);
  return this
});
$c_Ljapgolly_scalajs_react_internal_JsRepr$.prototype.apply__F1__F1__Ljapgolly_scalajs_react_internal_JsRepr = (function(toJs, fromJs) {
  return new $c_Ljapgolly_scalajs_react_internal_JsRepr$$anon$1().init___F1__F1(fromJs, toJs)
});
$c_Ljapgolly_scalajs_react_internal_JsRepr$.prototype.id__F1__Ljapgolly_scalajs_react_internal_JsRepr = (function(f) {
  return this.apply__F1__F1__Ljapgolly_scalajs_react_internal_JsRepr(f, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$1$2) {
      return x$1$2
    })
  })(this)))
});
var $d_Ljapgolly_scalajs_react_internal_JsRepr$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_JsRepr$: 0
}, false, "japgolly.scalajs.react.internal.JsRepr$", {
  Ljapgolly_scalajs_react_internal_JsRepr$: 1,
  O: 1,
  Ljapgolly_scalajs_react_internal_JsReprHighPri: 1,
  Ljapgolly_scalajs_react_internal_JsReprMedPri: 1,
  Ljapgolly_scalajs_react_internal_JsReprLowPri: 1
});
$c_Ljapgolly_scalajs_react_internal_JsRepr$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_JsRepr$;
var $n_Ljapgolly_scalajs_react_internal_JsRepr$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_JsRepr$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_JsRepr$)) {
    $n_Ljapgolly_scalajs_react_internal_JsRepr$ = new $c_Ljapgolly_scalajs_react_internal_JsRepr$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_JsRepr$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$() {
  $c_O.call(this);
  this.backgroundAttachment$module$1 = null;
  this.backgroundOrigin$module$1 = null;
  this.backgroundClip$module$1 = null;
  this.backgroundSize$module$1 = null;
  this.borderCollapse$module$1 = null;
  this.borderSpacing$module$1 = null;
  this.boxSizing$module$1 = null;
  this.color$module$1 = null;
  this.clip$module$1 = null;
  this.cursor$module$1 = null;
  this.float$module$1 = null;
  this.direction$module$1 = null;
  this.display$module$1 = null;
  this.pointerEvents$module$1 = null;
  this.listStyleImage$module$1 = null;
  this.listStylePosition$module$1 = null;
  this.wordWrap$module$1 = null;
  this.overflowWrap$module$1 = null;
  this.verticalAlign$module$1 = null;
  this.mask$module$1 = null;
  this.emptyCells$module$1 = null;
  this.listStyleType$module$1 = null;
  this.captionSide$module$1 = null;
  this.position$module$1 = null;
  this.quotes$module$1 = null;
  this.tableLayout$module$1 = null;
  this.fontSize$module$1 = null;
  this.fontWeight$module$1 = null;
  this.fontStyle$module$1 = null;
  this.clear$module$1 = null;
  this.outlineWidth$module$1 = null;
  this.outlineColor$module$1 = null;
  this.textDecoration$module$1 = null;
  this.textOverflow$module$1 = null;
  this.textUnderlinePosition$module$1 = null;
  this.textTransform$module$1 = null;
  this.visibility$module$1 = null;
  this.whiteSpace$module$1 = null;
  this.backfaceVisibility$module$1 = null;
  this.columns$module$1 = null;
  this.columnFill$module$1 = null;
  this.columnSpan$module$1 = null;
  this.columnRuleWidth$module$1 = null;
  this.columnRuleStyle$module$1 = null;
  this.alignContent$module$1 = null;
  this.alignSelf$module$1 = null;
  this.flexWrap$module$1 = null;
  this.alignItems$module$1 = null;
  this.justifyContent$module$1 = null;
  this.flexDirection$module$1 = null;
  this.transformStyle$module$1 = null;
  this.unicodeBidi$module$1 = null;
  this.wordBreak$module$1 = null;
  this.gridTemplateAreas$module$1 = null;
  this.justifyItems$module$1 = null;
  this.justifySelf$module$1 = null;
  this.aria$module$1 = null;
  this.autoComplete$module$1 = null;
  this.key$1 = null;
  this.onChange$1 = null;
  this.onClick$1 = null;
  this.onClickCapture$1 = null;
  this.role$module$1 = null;
  this.src$1 = null;
  this.target$module$1 = null;
  this.title$1 = null;
  this.type$1 = null;
  this.value$1 = null;
  this.wrap$module$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$ = this;
  $f_Ljapgolly_scalajs_react_vdom_HtmlAttrs__$$init$__V(this);
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$: 0
}, false, "japgolly.scalajs.react.vdom.HtmlAttrAndStyles$", {
  Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles: 1,
  Ljapgolly_scalajs_react_vdom_HtmlAttrs: 1,
  Ljapgolly_scalajs_react_vdom_HtmlStyles: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$;
var $n_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$)) {
    $n_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$ = new $c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_TagOf() {
  $c_O.call(this);
  this.rawElement$1 = null;
  this.tag$1 = null;
  this.modifiers$1 = null;
  this.namespace$1 = null;
  this.bitmap$0$1 = false
}
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_TagOf;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_TagOf() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_TagOf.prototype = $c_Ljapgolly_scalajs_react_vdom_TagOf.prototype;
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.toString__T = (function() {
  return (this.modifiers$1.isEmpty__Z() ? (("<" + this.tag$1) + " />") : (((("<" + this.tag$1) + ">\u2026</") + this.tag$1) + ">"))
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.init___T__sci_List__T = (function(tag, modifiers, namespace) {
  this.tag$1 = tag;
  this.modifiers$1 = modifiers;
  this.namespace$1 = namespace;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.rawNode__sjs_js_$bar = (function() {
  return $f_Ljapgolly_scalajs_react_vdom_VdomElement__rawNode__sjs_js_$bar(this)
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.rawElement__Ljapgolly_scalajs_react_raw_React$Element = (function() {
  return ((!this.bitmap$0$1) ? this.rawElement$lzycompute__p1__Ljapgolly_scalajs_react_raw_React$Element() : this.rawElement$1)
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  var jsx$1 = b.appendChild$1;
  var a = this.rawElement__Ljapgolly_scalajs_react_raw_React$Element();
  jsx$1.apply__O__O(a)
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.rawElement$lzycompute__p1__Ljapgolly_scalajs_react_raw_React$Element = (function() {
  if ((!this.bitmap$0$1)) {
    var b = new $c_Ljapgolly_scalajs_react_vdom_Builder$ToRawReactElement().init___();
    var arr = [];
    var current = this.modifiers$1;
    while (true) {
      var x = current;
      var x$2 = $m_sci_Nil$();
      if ((!((x !== null) && x.equals__O__Z(x$2)))) {
        arr.push($as_sci_Seq(current.head__O()));
        current = $as_sci_List(current.tail__O())
      } else {
        break
      }
    };
    var j = $uI(arr.length);
    while ((j > 0)) {
      j = (((-1) + j) | 0);
      $as_sc_IterableOnceOps(arr[j]).foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1) {
        return (function(x$1$2) {
          var x$1 = $as_Ljapgolly_scalajs_react_vdom_TagMod(x$1$2);
          x$1.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V(b$1)
        })
      })(this, b)))
    };
    this.rawElement$1 = b.render__T__Ljapgolly_scalajs_react_raw_React$Element(this.tag$1);
    this.bitmap$0$1 = true
  };
  return this.rawElement$1
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.apply__sci_Seq__Ljapgolly_scalajs_react_vdom_TagOf = (function(xs) {
  var this$1 = this.modifiers$1;
  var x$1 = new $c_sci_$colon$colon().init___O__sci_List(xs, this$1);
  var x$2 = this.tag$1;
  var x$3 = this.namespace$1;
  return new $c_Ljapgolly_scalajs_react_vdom_TagOf().init___T__sci_List__T(x$2, x$1, x$3)
});
var $d_Ljapgolly_scalajs_react_vdom_TagOf = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_TagOf: 0
}, false, "japgolly.scalajs.react.vdom.TagOf", {
  Ljapgolly_scalajs_react_vdom_TagOf: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_VdomElement: 1,
  Ljapgolly_scalajs_react_vdom_VdomNode: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_TagOf;
/** @constructor */
function $c_Ljava_io_OutputStream() {
  $c_O.call(this)
}
$c_Ljava_io_OutputStream.prototype = new $h_O();
$c_Ljava_io_OutputStream.prototype.constructor = $c_Ljava_io_OutputStream;
/** @constructor */
function $h_Ljava_io_OutputStream() {
  /*<skip>*/
}
$h_Ljava_io_OutputStream.prototype = $c_Ljava_io_OutputStream.prototype;
function $is_T(obj) {
  return ((typeof obj) === "string")
}
function $as_T(obj) {
  return (($is_T(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.String"))
}
function $isArrayOf_T(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
}
function $asArrayOf_T(obj, depth) {
  return (($isArrayOf_T(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.String;", depth))
}
var $d_T = new $TypeData().initClass({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), (void 0), $is_T);
var $d_jl_Byte = new $TypeData().initClass({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isByte(x)
}));
/** @constructor */
function $c_jl_CloneNotSupportedException() {
  $c_jl_Exception.call(this)
}
$c_jl_CloneNotSupportedException.prototype = new $h_jl_Exception();
$c_jl_CloneNotSupportedException.prototype.constructor = $c_jl_CloneNotSupportedException;
/** @constructor */
function $h_jl_CloneNotSupportedException() {
  /*<skip>*/
}
$h_jl_CloneNotSupportedException.prototype = $c_jl_CloneNotSupportedException.prototype;
$c_jl_CloneNotSupportedException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
var $d_jl_CloneNotSupportedException = new $TypeData().initClass({
  jl_CloneNotSupportedException: 0
}, false, "java.lang.CloneNotSupportedException", {
  jl_CloneNotSupportedException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_CloneNotSupportedException.prototype.$classData = $d_jl_CloneNotSupportedException;
function $isArrayOf_jl_Double(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
}
function $asArrayOf_jl_Double(obj, depth) {
  return (($isArrayOf_jl_Double(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Double;", depth))
}
var $d_jl_Double = new $TypeData().initClass({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "number")
}));
var $d_jl_Float = new $TypeData().initClass({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isFloat(x)
}));
var $d_jl_Integer = new $TypeData().initClass({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isInt(x)
}));
function $isArrayOf_jl_Long(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
}
function $asArrayOf_jl_Long(obj, depth) {
  return (($isArrayOf_jl_Long(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Long;", depth))
}
var $d_jl_Long = new $TypeData().initClass({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return (x instanceof $c_sjsr_RuntimeLong)
}));
/** @constructor */
function $c_jl_RuntimeException() {
  $c_jl_Exception.call(this)
}
$c_jl_RuntimeException.prototype = new $h_jl_Exception();
$c_jl_RuntimeException.prototype.constructor = $c_jl_RuntimeException;
/** @constructor */
function $h_jl_RuntimeException() {
  /*<skip>*/
}
$h_jl_RuntimeException.prototype = $c_jl_RuntimeException.prototype;
$c_jl_RuntimeException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_RuntimeException = new $TypeData().initClass({
  jl_RuntimeException: 0
}, false, "java.lang.RuntimeException", {
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_RuntimeException.prototype.$classData = $d_jl_RuntimeException;
var $d_jl_Short = new $TypeData().initClass({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isShort(x)
}));
/** @constructor */
function $c_jl_StringBuffer() {
  $c_O.call(this);
  this.builder$1 = null
}
$c_jl_StringBuffer.prototype = new $h_O();
$c_jl_StringBuffer.prototype.constructor = $c_jl_StringBuffer;
/** @constructor */
function $h_jl_StringBuffer() {
  /*<skip>*/
}
$h_jl_StringBuffer.prototype = $c_jl_StringBuffer.prototype;
$c_jl_StringBuffer.prototype.init___ = (function() {
  $c_jl_StringBuffer.prototype.init___jl_StringBuilder.call(this, new $c_jl_StringBuilder().init___());
  return this
});
$c_jl_StringBuffer.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var this$1 = this.builder$1;
  return this$1.substring__I__I__T(start, end)
});
$c_jl_StringBuffer.prototype.toString__T = (function() {
  return this.builder$1.java$lang$StringBuilder$$content$f
});
$c_jl_StringBuffer.prototype.append__T__jl_StringBuffer = (function(str) {
  var this$1 = this.builder$1;
  this$1.java$lang$StringBuilder$$content$f = (("" + this$1.java$lang$StringBuilder$$content$f) + str);
  return this
});
$c_jl_StringBuffer.prototype.init___jl_StringBuilder = (function(builder) {
  this.builder$1 = builder;
  return this
});
$c_jl_StringBuffer.prototype.append__C__jl_StringBuffer = (function(c) {
  this.builder$1.append__C__jl_StringBuilder(c);
  return this
});
var $d_jl_StringBuffer = new $TypeData().initClass({
  jl_StringBuffer: 0
}, false, "java.lang.StringBuffer", {
  jl_StringBuffer: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StringBuffer.prototype.$classData = $d_jl_StringBuffer;
/** @constructor */
function $c_jl_StringBuilder() {
  $c_O.call(this);
  this.java$lang$StringBuilder$$content$f = null
}
$c_jl_StringBuilder.prototype = new $h_O();
$c_jl_StringBuilder.prototype.constructor = $c_jl_StringBuilder;
/** @constructor */
function $h_jl_StringBuilder() {
  /*<skip>*/
}
$h_jl_StringBuilder.prototype = $c_jl_StringBuilder.prototype;
$c_jl_StringBuilder.prototype.init___ = (function() {
  this.java$lang$StringBuilder$$content$f = "";
  return this
});
$c_jl_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  return this.substring__I__I__T(start, end)
});
$c_jl_StringBuilder.prototype.toString__T = (function() {
  return this.java$lang$StringBuilder$$content$f
});
$c_jl_StringBuilder.prototype.length__I = (function() {
  var thiz = this.java$lang$StringBuilder$$content$f;
  return $uI(thiz.length)
});
$c_jl_StringBuilder.prototype.append__C__jl_StringBuilder = (function(c) {
  var str = $as_T($g.String.fromCharCode(c));
  this.java$lang$StringBuilder$$content$f = (("" + this.java$lang$StringBuilder$$content$f) + str);
  return this
});
$c_jl_StringBuilder.prototype.substring__I__I__T = (function(start, end) {
  var thiz = this.java$lang$StringBuilder$$content$f;
  return $as_T(thiz.substring(start, end))
});
$c_jl_StringBuilder.prototype.init___T = (function(str) {
  $c_jl_StringBuilder.prototype.init___.call(this);
  if ((str === null)) {
    throw new $c_jl_NullPointerException().init___()
  };
  this.java$lang$StringBuilder$$content$f = str;
  return this
});
$c_jl_StringBuilder.prototype.charAt__I__C = (function(index) {
  var thiz = this.java$lang$StringBuilder$$content$f;
  return (65535 & $uI(thiz.charCodeAt(index)))
});
$c_jl_StringBuilder.prototype.append__AC__jl_StringBuilder = (function(str) {
  var this$1 = $m_sjsr_RuntimeString$();
  var count = str.u.length;
  var str$1 = this$1.newString__AC__I__I__T(str, 0, count);
  this.java$lang$StringBuilder$$content$f = (("" + this.java$lang$StringBuilder$$content$f) + str$1);
  return this
});
var $d_jl_StringBuilder = new $TypeData().initClass({
  jl_StringBuilder: 0
}, false, "java.lang.StringBuilder", {
  jl_StringBuilder: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StringBuilder.prototype.$classData = $d_jl_StringBuilder;
/** @constructor */
function $c_jl_VirtualMachineError() {
  $c_jl_Error.call(this)
}
$c_jl_VirtualMachineError.prototype = new $h_jl_Error();
$c_jl_VirtualMachineError.prototype.constructor = $c_jl_VirtualMachineError;
/** @constructor */
function $h_jl_VirtualMachineError() {
  /*<skip>*/
}
$h_jl_VirtualMachineError.prototype = $c_jl_VirtualMachineError.prototype;
/** @constructor */
function $c_s_$eq$colon$eq() {
  $c_s_$less$colon$less.call(this)
}
$c_s_$eq$colon$eq.prototype = new $h_s_$less$colon$less();
$c_s_$eq$colon$eq.prototype.constructor = $c_s_$eq$colon$eq;
/** @constructor */
function $h_s_$eq$colon$eq() {
  /*<skip>*/
}
$h_s_$eq$colon$eq.prototype = $c_s_$eq$colon$eq.prototype;
function $f_s_reflect_ClassTag__equals__O__Z($thiz, x) {
  if ($is_s_reflect_ClassTag(x)) {
    var x$2 = $thiz.runtimeClass__jl_Class();
    var x$3 = $as_s_reflect_ClassTag(x).runtimeClass__jl_Class();
    return (x$2 === x$3)
  } else {
    return false
  }
}
function $f_s_reflect_ClassTag__prettyprint$1__ps_reflect_ClassTag__jl_Class__T($thiz, clazz) {
  if (clazz.isArray__Z()) {
    var clazz$1 = clazz.getComponentType__jl_Class();
    return (("Array[" + $f_s_reflect_ClassTag__prettyprint$1__ps_reflect_ClassTag__jl_Class__T($thiz, clazz$1)) + "]")
  } else {
    return clazz.getName__T()
  }
}
function $is_s_reflect_ClassTag(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_reflect_ClassTag)))
}
function $as_s_reflect_ClassTag(obj) {
  return (($is_s_reflect_ClassTag(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.reflect.ClassTag"))
}
function $isArrayOf_s_reflect_ClassTag(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_reflect_ClassTag)))
}
function $asArrayOf_s_reflect_ClassTag(obj, depth) {
  return (($isArrayOf_s_reflect_ClassTag(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.reflect.ClassTag;", depth))
}
/** @constructor */
function $c_sc_AbstractIterator() {
  $c_O.call(this)
}
$c_sc_AbstractIterator.prototype = new $h_O();
$c_sc_AbstractIterator.prototype.constructor = $c_sc_AbstractIterator;
/** @constructor */
function $h_sc_AbstractIterator() {
  /*<skip>*/
}
$h_sc_AbstractIterator.prototype = $c_sc_AbstractIterator.prototype;
$c_sc_AbstractIterator.prototype.concat__F0__sc_Iterator = (function(xs) {
  return $f_sc_Iterator__concat__F0__sc_Iterator(this, xs)
});
$c_sc_AbstractIterator.prototype.isEmpty__Z = (function() {
  return $f_sc_Iterator__isEmpty__Z(this)
});
$c_sc_AbstractIterator.prototype.toString__T = (function() {
  return "<iterator>"
});
$c_sc_AbstractIterator.prototype.foreach__F1__V = (function(f) {
  $f_sc_IterableOnceOps__foreach__F1__V(this, f)
});
$c_sc_AbstractIterator.prototype.iterator__sc_Iterator = (function() {
  return this
});
$c_sc_AbstractIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractIterator.prototype.drop__I__sc_Iterator = (function(n) {
  return $f_sc_Iterator__drop__I__sc_Iterator(this, n)
});
$c_sc_AbstractIterator.prototype.knownSize__I = (function() {
  return (-1)
});
function $f_sc_IndexedSeqOps__prepended__O__O($thiz, elem) {
  return $thiz.iterableFactory__sc_IterableFactory().from__sc_IterableOnce__O(new $c_sc_IndexedSeqView$Prepended().init___O__sc_IndexedSeqOps(elem, $thiz))
}
function $f_sc_IndexedSeqOps__drop__I__O($thiz, n) {
  return $thiz.fromSpecific__sc_IterableOnce__O(new $c_sc_IndexedSeqView$Drop().init___sc_IndexedSeqOps__I($thiz, n))
}
function $f_sc_Iterable__toString__T($thiz) {
  var start = ($thiz.className__T() + "(");
  return $f_sc_IterableOnceOps__mkString__T__T__T__T($thiz, start, ", ", ")")
}
function $is_sc_Iterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Iterable)))
}
function $as_sc_Iterable(obj) {
  return (($is_sc_Iterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Iterable"))
}
function $isArrayOf_sc_Iterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Iterable)))
}
function $asArrayOf_sc_Iterable(obj, depth) {
  return (($isArrayOf_sc_Iterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Iterable;", depth))
}
/** @constructor */
function $c_sc_Iterable$() {
  $c_sc_IterableFactory$Delegate.call(this)
}
$c_sc_Iterable$.prototype = new $h_sc_IterableFactory$Delegate();
$c_sc_Iterable$.prototype.constructor = $c_sc_Iterable$;
/** @constructor */
function $h_sc_Iterable$() {
  /*<skip>*/
}
$h_sc_Iterable$.prototype = $c_sc_Iterable$.prototype;
$c_sc_Iterable$.prototype.init___ = (function() {
  $c_sc_IterableFactory$Delegate.prototype.init___sc_IterableFactory.call(this, $m_sci_Iterable$());
  return this
});
var $d_sc_Iterable$ = new $TypeData().initClass({
  sc_Iterable$: 0
}, false, "scala.collection.Iterable$", {
  sc_Iterable$: 1,
  sc_IterableFactory$Delegate: 1,
  O: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sc_Iterable$.prototype.$classData = $d_sc_Iterable$;
var $n_sc_Iterable$ = (void 0);
function $m_sc_Iterable$() {
  if ((!$n_sc_Iterable$)) {
    $n_sc_Iterable$ = new $c_sc_Iterable$().init___()
  };
  return $n_sc_Iterable$
}
function $f_sc_LinearSeqOps__linearSeqEq$1__psc_LinearSeqOps__sc_LinearSeq__sc_LinearSeq__Z($thiz, a, b) {
  _linearSeqEq: while (true) {
    if ((a === b)) {
      return true
    } else {
      var this$1 = a;
      if ($f_sc_IterableOnceOps__nonEmpty__Z(this$1)) {
        var this$2 = b;
        var jsx$1 = $f_sc_IterableOnceOps__nonEmpty__Z(this$2)
      } else {
        var jsx$1 = false
      };
      if ((jsx$1 && $m_sr_BoxesRunTime$().equals__O__O__Z(a.head__O(), b.head__O()))) {
        var temp$a = $as_sc_LinearSeq(a.tail__O());
        var temp$b = $as_sc_LinearSeq(b.tail__O());
        a = temp$a;
        b = temp$b;
        continue _linearSeqEq
      } else {
        return (a.isEmpty__Z() && b.isEmpty__Z())
      }
    }
  }
}
function $f_sc_LinearSeqOps__apply__I__O($thiz, n) {
  if ((n < 0)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  var skipped = $as_sc_LinearSeq($thiz.drop__I__O(n));
  if (skipped.isEmpty__Z()) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  return skipped.head__O()
}
function $f_sc_LinearSeqOps__lengthCompare__I__I($thiz, len) {
  if ((len < 0)) {
    return 1
  } else {
    var i = 0;
    var xs = $as_sc_LinearSeq($thiz);
    return $f_sc_LinearSeqOps__loop$1__psc_LinearSeqOps__I__sc_LinearSeq__I__I($thiz, i, xs, len)
  }
}
function $f_sc_LinearSeqOps__sameElements__sc_IterableOnce__Z($thiz, that) {
  if ($is_sc_LinearSeq(that)) {
    var x2 = $as_sc_LinearSeq(that);
    var a = $as_sc_LinearSeq($thiz);
    var b = x2;
    return $f_sc_LinearSeqOps__linearSeqEq$1__psc_LinearSeqOps__sc_LinearSeq__sc_LinearSeq__Z($thiz, a, b)
  } else {
    return $f_sc_SeqOps__sameElements__sc_IterableOnce__Z($thiz, that)
  }
}
function $f_sc_LinearSeqOps__loop$1__psc_LinearSeqOps__I__sc_LinearSeq__I__I($thiz, i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      var temp$i = ((1 + i) | 0);
      var temp$xs = $as_sc_LinearSeq(xs.tail__O());
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
}
function $f_sc_LinearSeqOps__iterator__sc_Iterator($thiz) {
  return (($thiz.knownSize__I() === 0) ? $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f : new $c_sc_LinearSeqIterator().init___sc_LinearSeqOps($thiz))
}
function $f_sc_LinearSeqOps__length__I($thiz) {
  var these = $as_sc_LinearSeq($thiz);
  var len = 0;
  while (true) {
    var this$1 = these;
    if ($f_sc_IterableOnceOps__nonEmpty__Z(this$1)) {
      len = ((1 + len) | 0);
      these = $as_sc_LinearSeq(these.tail__O())
    } else {
      break
    }
  };
  return len
}
function $is_sc_LinearSeqOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqOps)))
}
function $as_sc_LinearSeqOps(obj) {
  return (($is_sc_LinearSeqOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqOps"))
}
function $isArrayOf_sc_LinearSeqOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqOps)))
}
function $asArrayOf_sc_LinearSeqOps(obj, depth) {
  return (($isArrayOf_sc_LinearSeqOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqOps;", depth))
}
/** @constructor */
function $c_sc_Map$() {
  $c_sc_MapFactory$Delegate.call(this);
  this.scala$collection$Map$$DefaultSentinel$2 = null
}
$c_sc_Map$.prototype = new $h_sc_MapFactory$Delegate();
$c_sc_Map$.prototype.constructor = $c_sc_Map$;
/** @constructor */
function $h_sc_Map$() {
  /*<skip>*/
}
$h_sc_Map$.prototype = $c_sc_Map$.prototype;
$c_sc_Map$.prototype.init___ = (function() {
  $c_sc_MapFactory$Delegate.prototype.init___sc_MapFactory.call(this, $m_sci_Map$());
  $n_sc_Map$ = this;
  this.scala$collection$Map$$DefaultSentinel$2 = new $c_O().init___();
  return this
});
var $d_sc_Map$ = new $TypeData().initClass({
  sc_Map$: 0
}, false, "scala.collection.Map$", {
  sc_Map$: 1,
  sc_MapFactory$Delegate: 1,
  O: 1,
  sc_MapFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sc_Map$.prototype.$classData = $d_sc_Map$;
var $n_sc_Map$ = (void 0);
function $m_sc_Map$() {
  if ((!$n_sc_Map$)) {
    $n_sc_Map$ = new $c_sc_Map$().init___()
  };
  return $n_sc_Map$
}
/** @constructor */
function $c_sc_MapOps$WithFilter() {
  $c_sc_IterableOps$WithFilter.call(this);
  this.self$3 = null;
  this.p$3 = null
}
$c_sc_MapOps$WithFilter.prototype = new $h_sc_IterableOps$WithFilter();
$c_sc_MapOps$WithFilter.prototype.constructor = $c_sc_MapOps$WithFilter;
/** @constructor */
function $h_sc_MapOps$WithFilter() {
  /*<skip>*/
}
$h_sc_MapOps$WithFilter.prototype = $c_sc_MapOps$WithFilter.prototype;
$c_sc_MapOps$WithFilter.prototype.init___sc_MapOps__F1 = (function(self, p) {
  this.self$3 = self;
  this.p$3 = p;
  $c_sc_IterableOps$WithFilter.prototype.init___sc_IterableOps__F1.call(this, self, p);
  return this
});
var $d_sc_MapOps$WithFilter = new $TypeData().initClass({
  sc_MapOps$WithFilter: 0
}, false, "scala.collection.MapOps$WithFilter", {
  sc_MapOps$WithFilter: 1,
  sc_IterableOps$WithFilter: 1,
  sc_WithFilter: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sc_MapOps$WithFilter.prototype.$classData = $d_sc_MapOps$WithFilter;
/** @constructor */
function $c_sc_SeqFactory$Delegate() {
  $c_O.call(this);
  this.delegate$1 = null
}
$c_sc_SeqFactory$Delegate.prototype = new $h_O();
$c_sc_SeqFactory$Delegate.prototype.constructor = $c_sc_SeqFactory$Delegate;
/** @constructor */
function $h_sc_SeqFactory$Delegate() {
  /*<skip>*/
}
$h_sc_SeqFactory$Delegate.prototype = $c_sc_SeqFactory$Delegate.prototype;
$c_sc_SeqFactory$Delegate.prototype.init___sc_SeqFactory = (function(delegate) {
  this.delegate$1 = delegate;
  return this
});
$c_sc_SeqFactory$Delegate.prototype.apply__sci_Seq__sc_SeqOps = (function(elems) {
  return $as_sc_SeqOps(this.delegate$1.apply__sci_Seq__O(elems))
});
$c_sc_SeqFactory$Delegate.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sc_SeqOps(source)
});
$c_sc_SeqFactory$Delegate.prototype.from__sc_IterableOnce__sc_SeqOps = (function(it) {
  return $as_sc_SeqOps(this.delegate$1.from__sc_IterableOnce__O(it))
});
$c_sc_SeqFactory$Delegate.prototype.apply__sci_Seq__O = (function(elems) {
  return this.apply__sci_Seq__sc_SeqOps(elems)
});
$c_sc_SeqFactory$Delegate.prototype.newBuilder__scm_Builder = (function() {
  return this.delegate$1.newBuilder__scm_Builder()
});
/** @constructor */
function $c_sci_Iterable$() {
  $c_sc_IterableFactory$Delegate.call(this)
}
$c_sci_Iterable$.prototype = new $h_sc_IterableFactory$Delegate();
$c_sci_Iterable$.prototype.constructor = $c_sci_Iterable$;
/** @constructor */
function $h_sci_Iterable$() {
  /*<skip>*/
}
$h_sci_Iterable$.prototype = $c_sci_Iterable$.prototype;
$c_sci_Iterable$.prototype.init___ = (function() {
  $c_sc_IterableFactory$Delegate.prototype.init___sc_IterableFactory.call(this, $m_sci_List$());
  return this
});
$c_sci_Iterable$.prototype.from__sc_IterableOnce__sci_Iterable = (function(it) {
  if ($is_sci_Iterable(it)) {
    var x2 = $as_sci_Iterable(it);
    return x2
  } else {
    return $as_sci_Iterable($c_sc_IterableFactory$Delegate.prototype.from__sc_IterableOnce__O.call(this, it))
  }
});
$c_sci_Iterable$.prototype.from__sc_IterableOnce__O = (function(it) {
  return this.from__sc_IterableOnce__sci_Iterable(it)
});
var $d_sci_Iterable$ = new $TypeData().initClass({
  sci_Iterable$: 0
}, false, "scala.collection.immutable.Iterable$", {
  sci_Iterable$: 1,
  sc_IterableFactory$Delegate: 1,
  O: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Iterable$.prototype.$classData = $d_sci_Iterable$;
var $n_sci_Iterable$ = (void 0);
function $m_sci_Iterable$() {
  if ((!$n_sci_Iterable$)) {
    $n_sci_Iterable$ = new $c_sci_Iterable$().init___()
  };
  return $n_sci_Iterable$
}
/** @constructor */
function $c_sci_LazyList$() {
  $c_O.call(this);
  this.$$undempty$1 = null;
  this.scala$collection$immutable$LazyList$$anyToMarker$1 = null
}
$c_sci_LazyList$.prototype = new $h_O();
$c_sci_LazyList$.prototype.constructor = $c_sci_LazyList$;
/** @constructor */
function $h_sci_LazyList$() {
  /*<skip>*/
}
$h_sci_LazyList$.prototype = $c_sci_LazyList$.prototype;
$c_sci_LazyList$.prototype.init___ = (function() {
  $n_sci_LazyList$ = this;
  var state = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $m_sci_LazyList$State$Empty$()
    })
  })(this));
  this.$$undempty$1 = new $c_sci_LazyList().init___F0(state).force__sci_LazyList();
  this.scala$collection$immutable$LazyList$$anyToMarker$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(x$10$2) {
      return $m_sr_Statics$PFMarker$()
    })
  })(this));
  return this
});
$c_sci_LazyList$.prototype.scala$collection$immutable$LazyList$$dropImpl__sci_LazyList__I__sci_LazyList = (function(ll, n) {
  var restRef = new $c_sr_ObjectRef().init___O(ll);
  var iRef = new $c_sr_IntRef().init___I(n);
  var state = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, restRef$1, iRef$1) {
    return (function() {
      var rest = $as_sci_LazyList(restRef$1.elem$1);
      var i = iRef$1.elem$1;
      while (((i > 0) && (!rest.isEmpty__Z()))) {
        var this$3 = rest;
        rest = this$3.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList();
        restRef$1.elem$1 = rest;
        i = (((-1) + i) | 0);
        iRef$1.elem$1 = i
      };
      return rest.scala$collection$immutable$LazyList$$state__sci_LazyList$State()
    })
  })(this, restRef, iRef));
  return new $c_sci_LazyList().init___F0(state)
});
$c_sci_LazyList$.prototype.scala$collection$immutable$LazyList$$stateFromIteratorConcatSuffix__sc_Iterator__F0__sci_LazyList$State = (function(it, suffix) {
  if (it.hasNext__Z()) {
    var hd = it.next__O();
    var state = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, it$1, suffix$1) {
      return (function() {
        return $m_sci_LazyList$().scala$collection$immutable$LazyList$$stateFromIteratorConcatSuffix__sc_Iterator__F0__sci_LazyList$State(it$1, suffix$1)
      })
    })(this, it, suffix));
    var tl = new $c_sci_LazyList().init___F0(state);
    return new $c_sci_LazyList$State$Cons().init___O__sci_LazyList(hd, tl)
  } else {
    return $as_sci_LazyList$State(suffix.apply__O())
  }
});
$c_sci_LazyList$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sci_LazyList(source)
});
$c_sci_LazyList$.prototype.from__sc_IterableOnce__sci_LazyList = (function(coll) {
  if ((coll instanceof $c_sci_LazyList)) {
    var x2 = $as_sci_LazyList(coll);
    return x2
  } else if ((coll.knownSize__I() === 0)) {
    return this.$$undempty$1
  } else {
    var state = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, coll$1) {
      return (function() {
        return $m_sci_LazyList$().scala$collection$immutable$LazyList$$stateFromIterator__sc_Iterator__sci_LazyList$State(coll$1.iterator__sc_Iterator())
      })
    })(this, coll));
    return new $c_sci_LazyList().init___F0(state)
  }
});
$c_sci_LazyList$.prototype.scala$collection$immutable$LazyList$$stateFromIterator__sc_Iterator__sci_LazyList$State = (function(it) {
  if (it.hasNext__Z()) {
    var hd = it.next__O();
    var state = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, it$1) {
      return (function() {
        return $m_sci_LazyList$().scala$collection$immutable$LazyList$$stateFromIterator__sc_Iterator__sci_LazyList$State(it$1)
      })
    })(this, it));
    var tl = new $c_sci_LazyList().init___F0(state);
    return new $c_sci_LazyList$State$Cons().init___O__sci_LazyList(hd, tl)
  } else {
    return $m_sci_LazyList$State$Empty$()
  }
});
$c_sci_LazyList$.prototype.apply__sci_Seq__O = (function(elems) {
  return this.from__sc_IterableOnce__sci_LazyList(elems)
});
$c_sci_LazyList$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_LazyList$LazyBuilder().init___()
});
var $d_sci_LazyList$ = new $TypeData().initClass({
  sci_LazyList$: 0
}, false, "scala.collection.immutable.LazyList$", {
  sci_LazyList$: 1,
  O: 1,
  sc_SeqFactory: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sci_LazyList$.prototype.$classData = $d_sci_LazyList$;
var $n_sci_LazyList$ = (void 0);
function $m_sci_LazyList$() {
  if ((!$n_sci_LazyList$)) {
    $n_sci_LazyList$ = new $c_sci_LazyList$().init___()
  };
  return $n_sci_LazyList$
}
/** @constructor */
function $c_sci_Stream$() {
  $c_O.call(this)
}
$c_sci_Stream$.prototype = new $h_O();
$c_sci_Stream$.prototype.constructor = $c_sci_Stream$;
/** @constructor */
function $h_sci_Stream$() {
  /*<skip>*/
}
$h_sci_Stream$.prototype = $c_sci_Stream$.prototype;
$c_sci_Stream$.prototype.init___ = (function() {
  return this
});
$c_sci_Stream$.prototype.fromIterator__sc_Iterator__sci_Stream = (function(it) {
  return (it.hasNext__Z() ? new $c_sci_Stream$Cons().init___O__F0(it.next__O(), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, it$1) {
    return (function() {
      return $m_sci_Stream$().fromIterator__sc_Iterator__sci_Stream(it$1)
    })
  })(this, it))) : $m_sci_Stream$Empty$())
});
$c_sci_Stream$.prototype.from__sc_IterableOnce__sci_Stream = (function(coll) {
  if ((coll instanceof $c_sci_Stream)) {
    var x2 = $as_sci_Stream(coll);
    return x2
  } else {
    return this.fromIterator__sc_Iterator__sci_Stream(coll.iterator__sc_Iterator())
  }
});
$c_sci_Stream$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sci_Stream(source)
});
$c_sci_Stream$.prototype.newBuilder__scm_Builder = (function() {
  var this$2 = new $c_scm_ArrayBuffer$$anon$1().init___();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(array$2) {
      var array = $as_scm_ArrayBuffer(array$2);
      return $m_sci_Stream$().from__sc_IterableOnce__sci_Stream(array)
    })
  })(this));
  return new $c_scm_Builder$$anon$1().init___scm_Builder__F1(this$2, f)
});
$c_sci_Stream$.prototype.apply__sci_Seq__O = (function(elems) {
  return this.from__sc_IterableOnce__sci_Stream(elems)
});
var $d_sci_Stream$ = new $TypeData().initClass({
  sci_Stream$: 0
}, false, "scala.collection.immutable.Stream$", {
  sci_Stream$: 1,
  O: 1,
  sc_SeqFactory: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$.prototype.$classData = $d_sci_Stream$;
var $n_sci_Stream$ = (void 0);
function $m_sci_Stream$() {
  if ((!$n_sci_Stream$)) {
    $n_sci_Stream$ = new $c_sci_Stream$().init___()
  };
  return $n_sci_Stream$
}
/** @constructor */
function $c_sci_WrappedString$() {
  $c_O.call(this);
  this.empty$1 = null
}
$c_sci_WrappedString$.prototype = new $h_O();
$c_sci_WrappedString$.prototype.constructor = $c_sci_WrappedString$;
/** @constructor */
function $h_sci_WrappedString$() {
  /*<skip>*/
}
$h_sci_WrappedString$.prototype = $c_sci_WrappedString$.prototype;
$c_sci_WrappedString$.prototype.init___ = (function() {
  $n_sci_WrappedString$ = this;
  this.empty$1 = new $c_sci_WrappedString().init___T("");
  return this
});
$c_sci_WrappedString$.prototype.fromSpecific__sc_IterableOnce__sci_WrappedString = (function(it) {
  var b = this.newBuilder__scm_Builder();
  var s = it.knownSize__I();
  if ((s >= 0)) {
    b.sizeHint__I__V(s)
  };
  b.addAll__sc_IterableOnce__scm_Growable(it);
  return $as_sci_WrappedString(b.result__O())
});
$c_sci_WrappedString$.prototype.newBuilder__scm_Builder = (function() {
  var this$1 = new $c_scm_StringBuilder().init___();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2) {
      var x = $as_T(x$2);
      return new $c_sci_WrappedString().init___T(x)
    })
  })(this));
  return new $c_scm_Builder$$anon$1().init___scm_Builder__F1(this$1, f)
});
var $d_sci_WrappedString$ = new $TypeData().initClass({
  sci_WrappedString$: 0
}, false, "scala.collection.immutable.WrappedString$", {
  sci_WrappedString$: 1,
  O: 1,
  sc_SpecificIterableFactory: 1,
  sc_Factory: 1,
  Ljava_io_Serializable: 1
});
$c_sci_WrappedString$.prototype.$classData = $d_sci_WrappedString$;
var $n_sci_WrappedString$ = (void 0);
function $m_sci_WrappedString$() {
  if ((!$n_sci_WrappedString$)) {
    $n_sci_WrappedString$ = new $c_sci_WrappedString$().init___()
  };
  return $n_sci_WrappedString$
}
/** @constructor */
function $c_scm_Builder$$anon$1() {
  $c_O.call(this);
  this.$$outer$1 = null;
  this.f$1$1 = null
}
$c_scm_Builder$$anon$1.prototype = new $h_O();
$c_scm_Builder$$anon$1.prototype.constructor = $c_scm_Builder$$anon$1;
/** @constructor */
function $h_scm_Builder$$anon$1() {
  /*<skip>*/
}
$h_scm_Builder$$anon$1.prototype = $c_scm_Builder$$anon$1.prototype;
$c_scm_Builder$$anon$1.prototype.init___scm_Builder__F1 = (function($$outer, f$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.f$1$1 = f$1;
  return this
});
$c_scm_Builder$$anon$1.prototype.result__O = (function() {
  return this.f$1$1.apply__O__O(this.$$outer$1.result__O())
});
$c_scm_Builder$$anon$1.prototype.addAll__sc_IterableOnce__scm_Growable = (function(xs) {
  return this.addAll__sc_IterableOnce__scm_Builder$$anon$1(xs)
});
$c_scm_Builder$$anon$1.prototype.addAll__sc_IterableOnce__scm_Builder$$anon$1 = (function(xs) {
  var this$1 = this.$$outer$1;
  this$1.addAll__sc_IterableOnce__scm_Growable(xs);
  return this
});
$c_scm_Builder$$anon$1.prototype.addOne__O__scm_Growable = (function(elem) {
  return this.addOne__O__scm_Builder$$anon$1(elem)
});
$c_scm_Builder$$anon$1.prototype.sizeHint__I__V = (function(size) {
  this.$$outer$1.sizeHint__I__V(size)
});
$c_scm_Builder$$anon$1.prototype.addOne__O__scm_Builder$$anon$1 = (function(x) {
  var this$1 = this.$$outer$1;
  this$1.addOne__O__scm_Growable(x);
  return this
});
var $d_scm_Builder$$anon$1 = new $TypeData().initClass({
  scm_Builder$$anon$1: 0
}, false, "scala.collection.mutable.Builder$$anon$1", {
  scm_Builder$$anon$1: 1,
  O: 1,
  scm_Builder: 1,
  scm_Growable: 1,
  scm_Clearable: 1
});
$c_scm_Builder$$anon$1.prototype.$classData = $d_scm_Builder$$anon$1;
/** @constructor */
function $c_scm_GrowableBuilder() {
  $c_O.call(this);
  this.elems$1 = null
}
$c_scm_GrowableBuilder.prototype = new $h_O();
$c_scm_GrowableBuilder.prototype.constructor = $c_scm_GrowableBuilder;
/** @constructor */
function $h_scm_GrowableBuilder() {
  /*<skip>*/
}
$h_scm_GrowableBuilder.prototype = $c_scm_GrowableBuilder.prototype;
$c_scm_GrowableBuilder.prototype.init___scm_Growable = (function(elems) {
  this.elems$1 = elems;
  return this
});
$c_scm_GrowableBuilder.prototype.addOne__O__scm_GrowableBuilder = (function(elem) {
  var this$1 = this.elems$1;
  this$1.addOne__O__scm_Growable(elem);
  return this
});
$c_scm_GrowableBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_GrowableBuilder.prototype.addAll__sc_IterableOnce__scm_Growable = (function(xs) {
  return this.addAll__sc_IterableOnce__scm_GrowableBuilder(xs)
});
$c_scm_GrowableBuilder.prototype.addOne__O__scm_Growable = (function(elem) {
  return this.addOne__O__scm_GrowableBuilder(elem)
});
$c_scm_GrowableBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_GrowableBuilder.prototype.addAll__sc_IterableOnce__scm_GrowableBuilder = (function(xs) {
  this.elems$1.addAll__sc_IterableOnce__scm_Growable(xs);
  return this
});
var $d_scm_GrowableBuilder = new $TypeData().initClass({
  scm_GrowableBuilder: 0
}, false, "scala.collection.mutable.GrowableBuilder", {
  scm_GrowableBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scm_Growable: 1,
  scm_Clearable: 1
});
$c_scm_GrowableBuilder.prototype.$classData = $d_scm_GrowableBuilder;
/** @constructor */
function $c_scm_Iterable$() {
  $c_sc_IterableFactory$Delegate.call(this)
}
$c_scm_Iterable$.prototype = new $h_sc_IterableFactory$Delegate();
$c_scm_Iterable$.prototype.constructor = $c_scm_Iterable$;
/** @constructor */
function $h_scm_Iterable$() {
  /*<skip>*/
}
$h_scm_Iterable$.prototype = $c_scm_Iterable$.prototype;
$c_scm_Iterable$.prototype.init___ = (function() {
  $c_sc_IterableFactory$Delegate.prototype.init___sc_IterableFactory.call(this, $m_scm_ArrayBuffer$());
  return this
});
var $d_scm_Iterable$ = new $TypeData().initClass({
  scm_Iterable$: 0
}, false, "scala.collection.mutable.Iterable$", {
  scm_Iterable$: 1,
  sc_IterableFactory$Delegate: 1,
  O: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_scm_Iterable$.prototype.$classData = $d_scm_Iterable$;
var $n_scm_Iterable$ = (void 0);
function $m_scm_Iterable$() {
  if ((!$n_scm_Iterable$)) {
    $n_scm_Iterable$ = new $c_scm_Iterable$().init___()
  };
  return $n_scm_Iterable$
}
/** @constructor */
function $c_sjs_js_WrappedDictionary$DictionaryIterator() {
  $c_O.call(this);
  this.dict$1 = null;
  this.keys$1 = null;
  this.index$1 = 0
}
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype = new $h_O();
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.constructor = $c_sjs_js_WrappedDictionary$DictionaryIterator;
/** @constructor */
function $h_sjs_js_WrappedDictionary$DictionaryIterator() {
  /*<skip>*/
}
$h_sjs_js_WrappedDictionary$DictionaryIterator.prototype = $c_sjs_js_WrappedDictionary$DictionaryIterator.prototype;
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.next__O = (function() {
  return this.next__T2()
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.concat__F0__sc_Iterator = (function(xs) {
  return $f_sc_Iterator__concat__F0__sc_Iterator(this, xs)
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.isEmpty__Z = (function() {
  return $f_sc_Iterator__isEmpty__Z(this)
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.init___sjs_js_Dictionary = (function(dict) {
  this.dict$1 = dict;
  this.keys$1 = $g.Object.keys(dict);
  this.index$1 = 0;
  return this
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.toString__T = (function() {
  return "<iterator>"
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.foreach__F1__V = (function(f) {
  $f_sc_IterableOnceOps__foreach__F1__V(this, f)
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.iterator__sc_Iterator = (function() {
  return this
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.next__T2 = (function() {
  var key = $as_T(this.keys$1[this.index$1]);
  this.index$1 = ((1 + this.index$1) | 0);
  var dict = this.dict$1;
  if ($uZ($m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1.call(dict, key))) {
    var jsx$1 = dict[key]
  } else {
    var jsx$1;
    throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
  };
  return new $c_T2().init___O__O(key, jsx$1)
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.hasNext__Z = (function() {
  return (this.index$1 < $uI(this.keys$1.length))
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.drop__I__sc_Iterator = (function(n) {
  return $f_sc_Iterator__drop__I__sc_Iterator(this, n)
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.knownSize__I = (function() {
  return (-1)
});
var $d_sjs_js_WrappedDictionary$DictionaryIterator = new $TypeData().initClass({
  sjs_js_WrappedDictionary$DictionaryIterator: 0
}, false, "scala.scalajs.js.WrappedDictionary$DictionaryIterator", {
  sjs_js_WrappedDictionary$DictionaryIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1
});
$c_sjs_js_WrappedDictionary$DictionaryIterator.prototype.$classData = $d_sjs_js_WrappedDictionary$DictionaryIterator;
/** @constructor */
function $c_sjsr_RuntimeLong() {
  $c_jl_Number.call(this);
  this.lo$2 = 0;
  this.hi$2 = 0
}
$c_sjsr_RuntimeLong.prototype = new $h_jl_Number();
$c_sjsr_RuntimeLong.prototype.constructor = $c_sjsr_RuntimeLong;
/** @constructor */
function $h_sjsr_RuntimeLong() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong.prototype = $c_sjsr_RuntimeLong.prototype;
$c_sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return $uJ(this)
});
$c_sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 | b.lo$2), (this.hi$2 | b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) >= ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return ((this.lo$2 << 24) >> 24)
});
$c_sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if ((that instanceof $c_sjsr_RuntimeLong)) {
    var x2 = $as_sjsr_RuntimeLong(that);
    return ((this.lo$2 === x2.lo$2) && (this.hi$2 === x2.hi$2))
  } else {
    return false
  }
});
$c_sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) < ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var blo = b.lo$2;
  var a0 = (65535 & alo);
  var a1 = ((alo >>> 16) | 0);
  var b0 = (65535 & blo);
  var b1 = ((blo >>> 16) | 0);
  var a0b0 = $imul(a0, b0);
  var a1b0 = $imul(a1, b0);
  var a0b1 = $imul(a0, b1);
  var lo = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
  var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
  var hi = (((((((($imul(alo, b.hi$2) + $imul(this.hi$2, blo)) | 0) + $imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
});
$c_sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, (l | (m << 22)), ((m >> 10) | (h << 12)));
  return this
});
$c_sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.remainderImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.toString__T = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.init___I__I = (function(lo, hi) {
  this.lo$2 = lo;
  this.hi$2 = hi;
  return this
});
$c_sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = $as_sjsr_RuntimeLong(x$1);
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) <= ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 & b.lo$2), (this.hi$2 & b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : ((this.hi$2 >>> n) | 0)), (((32 & n) === 0) ? ((this.hi$2 >>> n) | 0) : 0))
});
$c_sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) > ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (this.lo$2 << n) : 0), (((32 & n) === 0) ? (((((this.lo$2 >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (this.hi$2 << n)) : (this.lo$2 << n)))
});
$c_sjsr_RuntimeLong.prototype.init___I = (function(value) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, value, (value >> 31));
  return this
});
$c_sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(b) {
  return (!((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2)))
});
$c_sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo + b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) < ((-2147483648) ^ alo)) ? ((1 + ((ahi + bhi) | 0)) | 0) : ((ahi + bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return ((this.lo$2 << 16) >> 16)
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : (this.hi$2 >> n)), (((32 & n) === 0) ? (this.hi$2 >> n) : (this.hi$2 >> 31)))
});
$c_sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.divideImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return (this.lo$2 ^ this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  return new $c_sjsr_RuntimeLong().init___I__I((~this.lo$2), (~this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return $fround($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo - b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) > ((-2147483648) ^ alo)) ? (((-1) + ((ahi - bhi) | 0)) | 0) : ((ahi - bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 ^ b.lo$2), (this.hi$2 ^ b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(b) {
  return ((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2))
});
function $as_sjsr_RuntimeLong(obj) {
  return (((obj instanceof $c_sjsr_RuntimeLong) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
}
function $isArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
}
function $asArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (($isArrayOf_sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
}
var $d_sjsr_RuntimeLong = new $TypeData().initClass({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_sjsr_RuntimeLong.prototype.$classData = $d_sjsr_RuntimeLong;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_HtmlTags$a$() {
  $c_Ljapgolly_scalajs_react_vdom_TagOf.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$a$.prototype = new $h_Ljapgolly_scalajs_react_vdom_TagOf();
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$a$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlTags$a$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_HtmlTags$a$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_HtmlTags$a$.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlTags$a$.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$a$.prototype.init___Ljapgolly_scalajs_react_vdom_HtmlTags = (function($$outer) {
  $c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.init___T__sci_List__T.call(this, "a", $m_sci_Nil$(), $m_Ljapgolly_scalajs_react_vdom_Namespace$().Html$1);
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlTags$a$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlTags$a$: 0
}, false, "japgolly.scalajs.react.vdom.HtmlTags$a$", {
  Ljapgolly_scalajs_react_vdom_HtmlTags$a$: 1,
  Ljapgolly_scalajs_react_vdom_TagOf: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_VdomElement: 1,
  Ljapgolly_scalajs_react_vdom_VdomNode: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$a$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlTags$a$;
/** @constructor */
function $c_Ljava_io_FilterOutputStream() {
  $c_Ljava_io_OutputStream.call(this);
  this.out$2 = null
}
$c_Ljava_io_FilterOutputStream.prototype = new $h_Ljava_io_OutputStream();
$c_Ljava_io_FilterOutputStream.prototype.constructor = $c_Ljava_io_FilterOutputStream;
/** @constructor */
function $h_Ljava_io_FilterOutputStream() {
  /*<skip>*/
}
$h_Ljava_io_FilterOutputStream.prototype = $c_Ljava_io_FilterOutputStream.prototype;
$c_Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  this.out$2 = out;
  return this
});
/** @constructor */
function $c_T2() {
  $c_O.call(this);
  this.$$und1$f = null;
  this.$$und2$f = null
}
$c_T2.prototype = new $h_O();
$c_T2.prototype.constructor = $c_T2;
/** @constructor */
function $h_T2() {
  /*<skip>*/
}
$h_T2.prototype = $c_T2.prototype;
$c_T2.prototype.productPrefix__T = (function() {
  return "Tuple2"
});
$c_T2.prototype.productArity__I = (function() {
  return 2
});
$c_T2.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ((x$1 instanceof $c_T2)) {
    var Tuple2$1 = $as_T2(x$1);
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und1$f, Tuple2$1.$$und1$f) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und2$f, Tuple2$1.$$und2$f))
  } else {
    return false
  }
});
$c_T2.prototype.init___O__O = (function(_1, _2) {
  this.$$und1$f = _1;
  this.$$und2$f = _2;
  return this
});
$c_T2.prototype.productElement__I__O = (function(n) {
  return $f_s_Product2__productElement__I__O(this, n)
});
$c_T2.prototype.toString__T = (function() {
  return (((("(" + this.$$und1$f) + ",") + this.$$und2$f) + ")")
});
$c_T2.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__Z__I(this, (-889275714), false)
});
$c_T2.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $as_T2(obj) {
  return (((obj instanceof $c_T2) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Tuple2"))
}
function $isArrayOf_T2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)))
}
function $asArrayOf_T2(obj, depth) {
  return (($isArrayOf_T2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Tuple2;", depth))
}
var $d_T2 = new $TypeData().initClass({
  T2: 0
}, false, "scala.Tuple2", {
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  Ljava_io_Serializable: 1
});
$c_T2.prototype.$classData = $d_T2;
/** @constructor */
function $c_jl_ArithmeticException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ArithmeticException.prototype = new $h_jl_RuntimeException();
$c_jl_ArithmeticException.prototype.constructor = $c_jl_ArithmeticException;
/** @constructor */
function $h_jl_ArithmeticException() {
  /*<skip>*/
}
$h_jl_ArithmeticException.prototype = $c_jl_ArithmeticException.prototype;
$c_jl_ArithmeticException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_ArithmeticException = new $TypeData().initClass({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArithmeticException.prototype.$classData = $d_jl_ArithmeticException;
/** @constructor */
function $c_jl_ClassCastException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ClassCastException.prototype = new $h_jl_RuntimeException();
$c_jl_ClassCastException.prototype.constructor = $c_jl_ClassCastException;
/** @constructor */
function $h_jl_ClassCastException() {
  /*<skip>*/
}
$h_jl_ClassCastException.prototype = $c_jl_ClassCastException.prototype;
$c_jl_ClassCastException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
function $as_jl_ClassCastException(obj) {
  return (((obj instanceof $c_jl_ClassCastException) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.ClassCastException"))
}
function $isArrayOf_jl_ClassCastException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ClassCastException)))
}
function $asArrayOf_jl_ClassCastException(obj, depth) {
  return (($isArrayOf_jl_ClassCastException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.ClassCastException;", depth))
}
var $d_jl_ClassCastException = new $TypeData().initClass({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ClassCastException.prototype.$classData = $d_jl_ClassCastException;
/** @constructor */
function $c_jl_IllegalArgumentException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IllegalArgumentException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalArgumentException.prototype.constructor = $c_jl_IllegalArgumentException;
/** @constructor */
function $h_jl_IllegalArgumentException() {
  /*<skip>*/
}
$h_jl_IllegalArgumentException.prototype = $c_jl_IllegalArgumentException.prototype;
$c_jl_IllegalArgumentException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
$c_jl_IllegalArgumentException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_IllegalArgumentException = new $TypeData().initClass({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalArgumentException.prototype.$classData = $d_jl_IllegalArgumentException;
/** @constructor */
function $c_jl_IllegalStateException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IllegalStateException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalStateException.prototype.constructor = $c_jl_IllegalStateException;
/** @constructor */
function $h_jl_IllegalStateException() {
  /*<skip>*/
}
$h_jl_IllegalStateException.prototype = $c_jl_IllegalStateException.prototype;
$c_jl_IllegalStateException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_IllegalStateException = new $TypeData().initClass({
  jl_IllegalStateException: 0
}, false, "java.lang.IllegalStateException", {
  jl_IllegalStateException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalStateException.prototype.$classData = $d_jl_IllegalStateException;
/** @constructor */
function $c_jl_IndexOutOfBoundsException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IndexOutOfBoundsException.prototype = new $h_jl_RuntimeException();
$c_jl_IndexOutOfBoundsException.prototype.constructor = $c_jl_IndexOutOfBoundsException;
/** @constructor */
function $h_jl_IndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_IndexOutOfBoundsException.prototype = $c_jl_IndexOutOfBoundsException.prototype;
$c_jl_IndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_IndexOutOfBoundsException = new $TypeData().initClass({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IndexOutOfBoundsException.prototype.$classData = $d_jl_IndexOutOfBoundsException;
/** @constructor */
function $c_jl_JSConsoleBasedPrintStream$DummyOutputStream() {
  $c_Ljava_io_OutputStream.call(this)
}
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = new $h_Ljava_io_OutputStream();
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.constructor = $c_jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
function $h_jl_JSConsoleBasedPrintStream$DummyOutputStream() {
  /*<skip>*/
}
$h_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = $c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype;
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.init___ = (function() {
  return this
});
var $d_jl_JSConsoleBasedPrintStream$DummyOutputStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream$DummyOutputStream", {
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  jl_AutoCloseable: 1,
  Ljava_io_Flushable: 1
});
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
function $c_jl_NegativeArraySizeException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_NegativeArraySizeException.prototype = new $h_jl_RuntimeException();
$c_jl_NegativeArraySizeException.prototype.constructor = $c_jl_NegativeArraySizeException;
/** @constructor */
function $h_jl_NegativeArraySizeException() {
  /*<skip>*/
}
$h_jl_NegativeArraySizeException.prototype = $c_jl_NegativeArraySizeException.prototype;
$c_jl_NegativeArraySizeException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
var $d_jl_NegativeArraySizeException = new $TypeData().initClass({
  jl_NegativeArraySizeException: 0
}, false, "java.lang.NegativeArraySizeException", {
  jl_NegativeArraySizeException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NegativeArraySizeException.prototype.$classData = $d_jl_NegativeArraySizeException;
/** @constructor */
function $c_jl_NullPointerException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_NullPointerException.prototype = new $h_jl_RuntimeException();
$c_jl_NullPointerException.prototype.constructor = $c_jl_NullPointerException;
/** @constructor */
function $h_jl_NullPointerException() {
  /*<skip>*/
}
$h_jl_NullPointerException.prototype = $c_jl_NullPointerException.prototype;
$c_jl_NullPointerException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
var $d_jl_NullPointerException = new $TypeData().initClass({
  jl_NullPointerException: 0
}, false, "java.lang.NullPointerException", {
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NullPointerException.prototype.$classData = $d_jl_NullPointerException;
/** @constructor */
function $c_jl_SecurityException() {
  /*<skip>*/
}
function $as_jl_SecurityException(obj) {
  return (((obj instanceof $c_jl_SecurityException) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.SecurityException"))
}
function $isArrayOf_jl_SecurityException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_SecurityException)))
}
function $asArrayOf_jl_SecurityException(obj, depth) {
  return (($isArrayOf_jl_SecurityException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.SecurityException;", depth))
}
/** @constructor */
function $c_jl_UnsupportedOperationException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_UnsupportedOperationException.prototype = new $h_jl_RuntimeException();
$c_jl_UnsupportedOperationException.prototype.constructor = $c_jl_UnsupportedOperationException;
/** @constructor */
function $h_jl_UnsupportedOperationException() {
  /*<skip>*/
}
$h_jl_UnsupportedOperationException.prototype = $c_jl_UnsupportedOperationException.prototype;
$c_jl_UnsupportedOperationException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
$c_jl_UnsupportedOperationException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_UnsupportedOperationException = new $TypeData().initClass({
  jl_UnsupportedOperationException: 0
}, false, "java.lang.UnsupportedOperationException", {
  jl_UnsupportedOperationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_UnsupportedOperationException.prototype.$classData = $d_jl_UnsupportedOperationException;
/** @constructor */
function $c_ju_AbstractSet() {
  $c_ju_AbstractCollection.call(this)
}
$c_ju_AbstractSet.prototype = new $h_ju_AbstractCollection();
$c_ju_AbstractSet.prototype.constructor = $c_ju_AbstractSet;
/** @constructor */
function $h_ju_AbstractSet() {
  /*<skip>*/
}
$h_ju_AbstractSet.prototype = $c_ju_AbstractSet.prototype;
$c_ju_AbstractSet.prototype.equals__O__Z = (function(that) {
  if ((that === this)) {
    return true
  } else if ($is_ju_Collection(that)) {
    var x2 = $as_ju_Collection(that);
    return ((x2.size__I() === this.size__I()) && this.containsAll__ju_Collection__Z(x2))
  } else {
    return false
  }
});
$c_ju_AbstractSet.prototype.hashCode__I = (function() {
  var __self = this.iterator__ju_Iterator();
  var result = 0;
  while (__self.hasNext__Z()) {
    var arg1 = result;
    var arg2 = __self.next__O();
    var prev = $uI(arg1);
    result = (($objectHashCode(arg2) + prev) | 0)
  };
  return $uI(result)
});
/** @constructor */
function $c_ju_HashMap() {
  $c_ju_AbstractMap.call(this);
  this.java$util$HashMap$$loadFactor$f = 0.0;
  this.java$util$HashMap$$table$f = null;
  this.threshold$2 = 0;
  this.contentSize$2 = 0
}
$c_ju_HashMap.prototype = new $h_ju_AbstractMap();
$c_ju_HashMap.prototype.constructor = $c_ju_HashMap;
/** @constructor */
function $h_ju_HashMap() {
  /*<skip>*/
}
$h_ju_HashMap.prototype = $c_ju_HashMap.prototype;
$c_ju_HashMap.prototype.java$util$HashMap$$put0__O__O__I__O = (function(key, value, hash) {
  if ((((1 + this.contentSize$2) | 0) >= this.threshold$2)) {
    this.growTable__p2__V()
  };
  var idx = (hash & (((-1) + this.java$util$HashMap$$table$f.u.length) | 0));
  return this.put0__p2__O__O__I__I__O(key, value, hash, idx)
});
$c_ju_HashMap.prototype.init___ = (function() {
  $c_ju_HashMap.prototype.init___I__D.call(this, 16, 0.75);
  return this
});
$c_ju_HashMap.prototype.get__O__O = (function(key) {
  if ((key === null)) {
    var hash = 0
  } else {
    var originalHash = $objectHashCode(key);
    var hash = (originalHash ^ ((originalHash >>> 16) | 0))
  };
  var node = this.java$util$HashMap$$findNode0__O__I__I__ju_HashMap$Node(key, hash, (hash & (((-1) + this.java$util$HashMap$$table$f.u.length) | 0)));
  return ((node === null) ? null : node.value$1)
});
$c_ju_HashMap.prototype.size__I = (function() {
  return this.contentSize$2
});
$c_ju_HashMap.prototype.growTable__p2__V = (function() {
  var oldTable = this.java$util$HashMap$$table$f;
  var oldlen = oldTable.u.length;
  var newlen = (oldlen << 1);
  var newTable = $newArrayObject($d_ju_HashMap$Node.getArrayOf(), [newlen]);
  this.java$util$HashMap$$table$f = newTable;
  this.threshold$2 = $doubleToInt((newlen * this.java$util$HashMap$$loadFactor$f));
  var i = 0;
  while ((i < oldlen)) {
    var lastLow = null;
    var lastHigh = null;
    var node = oldTable.get(i);
    while ((node !== null)) {
      if (((node.hash$1 & oldlen) === 0)) {
        node.previous$1 = lastLow;
        if ((lastLow === null)) {
          newTable.set(i, node)
        } else {
          lastLow.next$1 = node
        };
        lastLow = node
      } else {
        node.previous$1 = lastHigh;
        if ((lastHigh === null)) {
          newTable.set(((oldlen + i) | 0), node)
        } else {
          lastHigh.next$1 = node
        };
        lastHigh = node
      };
      node = node.next$1
    };
    if ((lastLow !== null)) {
      lastLow.next$1 = null
    };
    if ((lastHigh !== null)) {
      lastHigh.next$1 = null
    };
    i = ((1 + i) | 0)
  }
});
$c_ju_HashMap.prototype.java$util$HashMap$$findNode0__O__I__I__ju_HashMap$Node = (function(key, hash, idx) {
  var node = this.java$util$HashMap$$table$f.get(idx);
  _loop: while (true) {
    if ((node === null)) {
      return null
    } else {
      if ((hash === node.hash$1)) {
        var b = node.key$1;
        var jsx$1 = ((key === null) ? (b === null) : $objectEquals(key, b))
      } else {
        var jsx$1 = false
      };
      if (jsx$1) {
        return node
      } else if ((hash < node.hash$1)) {
        return null
      } else {
        node = node.next$1;
        continue _loop
      }
    }
  }
});
$c_ju_HashMap.prototype.put0__p2__O__O__I__I__O = (function(key, value, hash, idx) {
  var x1 = this.java$util$HashMap$$table$f.get(idx);
  if ((x1 === null)) {
    var newNode = new $c_ju_HashMap$Node().init___O__I__O__ju_HashMap$Node__ju_HashMap$Node(key, hash, value, null, null);
    this.java$util$HashMap$$table$f.set(idx, newNode)
  } else {
    var prev = null;
    var n = x1;
    while (((n !== null) && (n.hash$1 <= hash))) {
      if ((n.hash$1 === hash)) {
        var b = n.key$1;
        var jsx$1 = ((key === null) ? (b === null) : $objectEquals(key, b))
      } else {
        var jsx$1 = false
      };
      if (jsx$1) {
        var old = n.value$1;
        n.value$1 = value;
        return old
      };
      prev = n;
      n = n.next$1
    };
    var previous = prev;
    var next = n;
    var newNode$2 = new $c_ju_HashMap$Node().init___O__I__O__ju_HashMap$Node__ju_HashMap$Node(key, hash, value, previous, next);
    if ((prev === null)) {
      this.java$util$HashMap$$table$f.set(idx, newNode$2)
    } else {
      prev.next$1 = newNode$2
    };
    if ((n !== null)) {
      n.previous$1 = newNode$2
    }
  };
  this.contentSize$2 = ((1 + this.contentSize$2) | 0);
  return null
});
$c_ju_HashMap.prototype.init___I__D = (function(initialCapacity, loadFactor) {
  this.java$util$HashMap$$loadFactor$f = loadFactor;
  if ((initialCapacity < 0)) {
    throw new $c_jl_IllegalArgumentException().init___T("initialCapacity < 0")
  };
  if ((loadFactor <= 0.0)) {
    throw new $c_jl_IllegalArgumentException().init___T("loadFactor <= 0.0")
  };
  var a = (((-1) + initialCapacity) | 0);
  var i = ((a > 4) ? a : 4);
  var a$1 = ((((-2147483648) >> $clz32(i)) & i) << 1);
  this.java$util$HashMap$$table$f = $newArrayObject($d_ju_HashMap$Node.getArrayOf(), [((a$1 < 1073741824) ? a$1 : 1073741824)]);
  var size = this.java$util$HashMap$$table$f.u.length;
  this.threshold$2 = $doubleToInt((size * this.java$util$HashMap$$loadFactor$f));
  this.contentSize$2 = 0;
  return this
});
var $d_ju_HashMap = new $TypeData().initClass({
  ju_HashMap: 0
}, false, "java.util.HashMap", {
  ju_HashMap: 1,
  ju_AbstractMap: 1,
  O: 1,
  ju_Map: 1,
  Ljava_io_Serializable: 1,
  jl_Cloneable: 1
});
$c_ju_HashMap.prototype.$classData = $d_ju_HashMap;
/** @constructor */
function $c_ju_Hashtable() {
  $c_ju_Dictionary.call(this);
  this.inner$2 = null
}
$c_ju_Hashtable.prototype = new $h_ju_Dictionary();
$c_ju_Hashtable.prototype.constructor = $c_ju_Hashtable;
/** @constructor */
function $h_ju_Hashtable() {
  /*<skip>*/
}
$h_ju_Hashtable.prototype = $c_ju_Hashtable.prototype;
$c_ju_Hashtable.prototype.put__O__O__O = (function(key, value) {
  var this$1 = this.inner$2;
  if ((key === null)) {
    var jsx$1 = 0
  } else {
    var originalHash = $objectHashCode(key);
    var jsx$1 = (originalHash ^ ((originalHash >>> 16) | 0))
  };
  return this$1.java$util$HashMap$$put0__O__O__I__O(key, value, jsx$1)
});
$c_ju_Hashtable.prototype.toString__T = (function() {
  return this.inner$2.toString__T()
});
$c_ju_Hashtable.prototype.get__O__O = (function(key) {
  return this.inner$2.get__O__O(key)
});
$c_ju_Hashtable.prototype.size__I = (function() {
  return this.inner$2.contentSize$2
});
$c_ju_Hashtable.prototype.init___ju_HashMap = (function(inner) {
  this.inner$2 = inner;
  return this
});
/** @constructor */
function $c_ju_NoSuchElementException() {
  $c_jl_RuntimeException.call(this)
}
$c_ju_NoSuchElementException.prototype = new $h_jl_RuntimeException();
$c_ju_NoSuchElementException.prototype.constructor = $c_ju_NoSuchElementException;
/** @constructor */
function $h_ju_NoSuchElementException() {
  /*<skip>*/
}
$h_ju_NoSuchElementException.prototype = $c_ju_NoSuchElementException.prototype;
$c_ju_NoSuchElementException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
$c_ju_NoSuchElementException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_ju_NoSuchElementException = new $TypeData().initClass({
  ju_NoSuchElementException: 0
}, false, "java.util.NoSuchElementException", {
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_NoSuchElementException.prototype.$classData = $d_ju_NoSuchElementException;
/** @constructor */
function $c_s_$less$colon$less$$anon$1() {
  $c_s_$eq$colon$eq.call(this)
}
$c_s_$less$colon$less$$anon$1.prototype = new $h_s_$eq$colon$eq();
$c_s_$less$colon$less$$anon$1.prototype.constructor = $c_s_$less$colon$less$$anon$1;
/** @constructor */
function $h_s_$less$colon$less$$anon$1() {
  /*<skip>*/
}
$h_s_$less$colon$less$$anon$1.prototype = $c_s_$less$colon$less$$anon$1.prototype;
$c_s_$less$colon$less$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_$less$colon$less$$anon$1.prototype.compose__F1__F1 = (function(r) {
  return r
});
$c_s_$less$colon$less$$anon$1.prototype.apply__O__O = (function(x) {
  return x
});
$c_s_$less$colon$less$$anon$1.prototype.toString__T = (function() {
  return "generalized constraint"
});
var $d_s_$less$colon$less$$anon$1 = new $TypeData().initClass({
  s_$less$colon$less$$anon$1: 0
}, false, "scala.$less$colon$less$$anon$1", {
  s_$less$colon$less$$anon$1: 1,
  s_$eq$colon$eq: 1,
  s_$less$colon$less: 1,
  O: 1,
  F1: 1,
  Ljava_io_Serializable: 1
});
$c_s_$less$colon$less$$anon$1.prototype.$classData = $d_s_$less$colon$less$$anon$1;
/** @constructor */
function $c_s_MatchError() {
  $c_jl_RuntimeException.call(this);
  this.objString$4 = null;
  this.obj$4 = null;
  this.bitmap$0$4 = false
}
$c_s_MatchError.prototype = new $h_jl_RuntimeException();
$c_s_MatchError.prototype.constructor = $c_s_MatchError;
/** @constructor */
function $h_s_MatchError() {
  /*<skip>*/
}
$h_s_MatchError.prototype = $c_s_MatchError.prototype;
$c_s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
$c_s_MatchError.prototype.ofClass$1__p4__T = (function() {
  var this$1 = this.obj$4;
  return ("of class " + $objectGetClass(this$1).getName__T())
});
$c_s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return ((($objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
$c_s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
$c_s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
$c_s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
var $d_s_MatchError = new $TypeData().initClass({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_MatchError.prototype.$classData = $d_s_MatchError;
/** @constructor */
function $c_s_Option() {
  $c_O.call(this)
}
$c_s_Option.prototype = new $h_O();
$c_s_Option.prototype.constructor = $c_s_Option;
/** @constructor */
function $h_s_Option() {
  /*<skip>*/
}
$h_s_Option.prototype = $c_s_Option.prototype;
$c_s_Option.prototype.isEmpty__Z = (function() {
  return (this === $m_s_None$())
});
$c_s_Option.prototype.iterator__sc_Iterator = (function() {
  if (this.isEmpty__Z()) {
    return $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f
  } else {
    $m_sc_Iterator$();
    var a = this.get__O();
    return new $c_sc_Iterator$$anon$20().init___O(a)
  }
});
$c_s_Option.prototype.knownSize__I = (function() {
  return (this.isEmpty__Z() ? 0 : 1)
});
function $as_s_Option(obj) {
  return (((obj instanceof $c_s_Option) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Option"))
}
function $isArrayOf_s_Option(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Option)))
}
function $asArrayOf_s_Option(obj, depth) {
  return (($isArrayOf_s_Option(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Option;", depth))
}
/** @constructor */
function $c_sc_Iterator$$anon$19() {
  $c_sc_AbstractIterator.call(this)
}
$c_sc_Iterator$$anon$19.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$19.prototype.constructor = $c_sc_Iterator$$anon$19;
/** @constructor */
function $h_sc_Iterator$$anon$19() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$19.prototype = $c_sc_Iterator$$anon$19.prototype;
$c_sc_Iterator$$anon$19.prototype.init___ = (function() {
  return this
});
$c_sc_Iterator$$anon$19.prototype.next__O = (function() {
  this.next__sr_Nothing$()
});
$c_sc_Iterator$$anon$19.prototype.next__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next on empty iterator")
});
$c_sc_Iterator$$anon$19.prototype.hasNext__Z = (function() {
  return false
});
$c_sc_Iterator$$anon$19.prototype.knownSize__I = (function() {
  return 0
});
var $d_sc_Iterator$$anon$19 = new $TypeData().initClass({
  sc_Iterator$$anon$19: 0
}, false, "scala.collection.Iterator$$anon$19", {
  sc_Iterator$$anon$19: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1
});
$c_sc_Iterator$$anon$19.prototype.$classData = $d_sc_Iterator$$anon$19;
/** @constructor */
function $c_sc_Iterator$$anon$20() {
  $c_sc_AbstractIterator.call(this);
  this.consumed$2 = false;
  this.a$1$2 = null
}
$c_sc_Iterator$$anon$20.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$20.prototype.constructor = $c_sc_Iterator$$anon$20;
/** @constructor */
function $h_sc_Iterator$$anon$20() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$20.prototype = $c_sc_Iterator$$anon$20.prototype;
$c_sc_Iterator$$anon$20.prototype.next__O = (function() {
  if (this.consumed$2) {
    return $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f.next__O()
  } else {
    this.consumed$2 = true;
    return this.a$1$2
  }
});
$c_sc_Iterator$$anon$20.prototype.init___O = (function(a$1) {
  this.a$1$2 = a$1;
  this.consumed$2 = false;
  return this
});
$c_sc_Iterator$$anon$20.prototype.hasNext__Z = (function() {
  return (!this.consumed$2)
});
var $d_sc_Iterator$$anon$20 = new $TypeData().initClass({
  sc_Iterator$$anon$20: 0
}, false, "scala.collection.Iterator$$anon$20", {
  sc_Iterator$$anon$20: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1
});
$c_sc_Iterator$$anon$20.prototype.$classData = $d_sc_Iterator$$anon$20;
/** @constructor */
function $c_sc_Iterator$$anon$6() {
  $c_sc_AbstractIterator.call(this);
  this.hd$2 = null;
  this.hdDefined$2 = false;
  this.$$outer$2 = null;
  this.p$1$2 = null;
  this.isFlipped$1$2 = false
}
$c_sc_Iterator$$anon$6.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$6.prototype.constructor = $c_sc_Iterator$$anon$6;
/** @constructor */
function $h_sc_Iterator$$anon$6() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$6.prototype = $c_sc_Iterator$$anon$6.prototype;
$c_sc_Iterator$$anon$6.prototype.init___sc_Iterator__F1__Z = (function($$outer, p$1, isFlipped$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.p$1$2 = p$1;
  this.isFlipped$1$2 = isFlipped$1;
  this.hdDefined$2 = false;
  return this
});
$c_sc_Iterator$$anon$6.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    this.hdDefined$2 = false;
    return this.hd$2
  } else {
    return $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f.next__O()
  }
});
$c_sc_Iterator$$anon$6.prototype.hasNext__Z = (function() {
  if (this.hdDefined$2) {
    return true
  } else {
    if ((!this.$$outer$2.hasNext__Z())) {
      return false
    };
    this.hd$2 = this.$$outer$2.next__O();
    while (($uZ(this.p$1$2.apply__O__O(this.hd$2)) === this.isFlipped$1$2)) {
      if ((!this.$$outer$2.hasNext__Z())) {
        return false
      };
      this.hd$2 = this.$$outer$2.next__O()
    };
    this.hdDefined$2 = true;
    return true
  }
});
var $d_sc_Iterator$$anon$6 = new $TypeData().initClass({
  sc_Iterator$$anon$6: 0
}, false, "scala.collection.Iterator$$anon$6", {
  sc_Iterator$$anon$6: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1
});
$c_sc_Iterator$$anon$6.prototype.$classData = $d_sc_Iterator$$anon$6;
/** @constructor */
function $c_sc_Iterator$$anon$9() {
  $c_sc_AbstractIterator.call(this);
  this.$$outer$2 = null;
  this.f$2$2 = null
}
$c_sc_Iterator$$anon$9.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$9.prototype.constructor = $c_sc_Iterator$$anon$9;
/** @constructor */
function $h_sc_Iterator$$anon$9() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$9.prototype = $c_sc_Iterator$$anon$9.prototype;
$c_sc_Iterator$$anon$9.prototype.next__O = (function() {
  return this.f$2$2.apply__O__O(this.$$outer$2.next__O())
});
$c_sc_Iterator$$anon$9.prototype.init___sc_Iterator__F1 = (function($$outer, f$2) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.f$2$2 = f$2;
  return this
});
$c_sc_Iterator$$anon$9.prototype.hasNext__Z = (function() {
  return this.$$outer$2.hasNext__Z()
});
$c_sc_Iterator$$anon$9.prototype.knownSize__I = (function() {
  return this.$$outer$2.knownSize__I()
});
var $d_sc_Iterator$$anon$9 = new $TypeData().initClass({
  sc_Iterator$$anon$9: 0
}, false, "scala.collection.Iterator$$anon$9", {
  sc_Iterator$$anon$9: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1
});
$c_sc_Iterator$$anon$9.prototype.$classData = $d_sc_Iterator$$anon$9;
/** @constructor */
function $c_sc_Iterator$ConcatIterator() {
  $c_sc_AbstractIterator.call(this);
  this.current$2 = null;
  this.tail$2 = null;
  this.last$2 = null;
  this.currentHasNextChecked$2 = false
}
$c_sc_Iterator$ConcatIterator.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$ConcatIterator.prototype.constructor = $c_sc_Iterator$ConcatIterator;
/** @constructor */
function $h_sc_Iterator$ConcatIterator() {
  /*<skip>*/
}
$h_sc_Iterator$ConcatIterator.prototype = $c_sc_Iterator$ConcatIterator.prototype;
$c_sc_Iterator$ConcatIterator.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    this.currentHasNextChecked$2 = false;
    return this.current$2.next__O()
  } else {
    return $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f.next__O()
  }
});
$c_sc_Iterator$ConcatIterator.prototype.concat__F0__sc_Iterator = (function(that) {
  var c = new $c_sc_Iterator$ConcatIteratorCell().init___F0__sc_Iterator$ConcatIteratorCell(that, null);
  if ((this.tail$2 === null)) {
    this.tail$2 = c;
    this.last$2 = c
  } else {
    this.last$2.tail$1 = c;
    this.last$2 = c
  };
  if ((this.current$2 === null)) {
    this.current$2 = $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f
  };
  return this
});
$c_sc_Iterator$ConcatIterator.prototype.advance$1__p2__Z = (function() {
  _advance: while (true) {
    if ((this.tail$2 === null)) {
      this.current$2 = null;
      this.last$2 = null;
      return false
    } else {
      this.current$2 = this.tail$2.headIterator__sc_Iterator();
      if ((this.last$2 === this.tail$2)) {
        this.last$2 = this.last$2.tail$1
      };
      this.tail$2 = this.tail$2.tail$1;
      this.merge$1__p2__V();
      if (this.currentHasNextChecked$2) {
        return true
      } else if (((this.current$2 !== null) && this.current$2.hasNext__Z())) {
        this.currentHasNextChecked$2 = true;
        return true
      } else {
        continue _advance
      }
    }
  }
});
$c_sc_Iterator$ConcatIterator.prototype.merge$1__p2__V = (function() {
  _merge: while (true) {
    if ((this.current$2 instanceof $c_sc_Iterator$ConcatIterator)) {
      var c = $as_sc_Iterator$ConcatIterator(this.current$2);
      this.current$2 = c.current$2;
      this.currentHasNextChecked$2 = c.currentHasNextChecked$2;
      if ((c.tail$2 !== null)) {
        if ((this.last$2 === null)) {
          this.last$2 = c.last$2
        };
        c.last$2.tail$1 = this.tail$2;
        this.tail$2 = c.tail$2
      };
      continue _merge
    };
    break
  }
});
$c_sc_Iterator$ConcatIterator.prototype.hasNext__Z = (function() {
  if (this.currentHasNextChecked$2) {
    return true
  } else if ((this.current$2 !== null)) {
    if (this.current$2.hasNext__Z()) {
      this.currentHasNextChecked$2 = true;
      return true
    } else {
      return this.advance$1__p2__Z()
    }
  } else {
    return false
  }
});
$c_sc_Iterator$ConcatIterator.prototype.init___sc_Iterator = (function(current) {
  this.current$2 = current;
  this.tail$2 = null;
  this.last$2 = null;
  this.currentHasNextChecked$2 = false;
  return this
});
function $as_sc_Iterator$ConcatIterator(obj) {
  return (((obj instanceof $c_sc_Iterator$ConcatIterator) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Iterator$ConcatIterator"))
}
function $isArrayOf_sc_Iterator$ConcatIterator(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Iterator$ConcatIterator)))
}
function $asArrayOf_sc_Iterator$ConcatIterator(obj, depth) {
  return (($isArrayOf_sc_Iterator$ConcatIterator(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Iterator$ConcatIterator;", depth))
}
var $d_sc_Iterator$ConcatIterator = new $TypeData().initClass({
  sc_Iterator$ConcatIterator: 0
}, false, "scala.collection.Iterator$ConcatIterator", {
  sc_Iterator$ConcatIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1
});
$c_sc_Iterator$ConcatIterator.prototype.$classData = $d_sc_Iterator$ConcatIterator;
/** @constructor */
function $c_sc_LinearSeqIterator() {
  $c_sc_AbstractIterator.call(this);
  this.coll$2 = null;
  this.these$2 = null
}
$c_sc_LinearSeqIterator.prototype = new $h_sc_AbstractIterator();
$c_sc_LinearSeqIterator.prototype.constructor = $c_sc_LinearSeqIterator;
/** @constructor */
function $h_sc_LinearSeqIterator() {
  /*<skip>*/
}
$h_sc_LinearSeqIterator.prototype = $c_sc_LinearSeqIterator.prototype;
$c_sc_LinearSeqIterator.prototype.next__O = (function() {
  if ($f_sc_Iterator__isEmpty__Z(this)) {
    return $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f.next__O()
  } else {
    var cur = this.these$2.v__sc_LinearSeqOps();
    var result = cur.head__O();
    this.these$2 = new $c_sc_LinearSeqIterator$LazyCell().init___sc_LinearSeqIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, cur$1) {
      return (function() {
        return $as_sc_LinearSeq(cur$1.tail__O())
      })
    })(this, cur)));
    return result
  }
});
$c_sc_LinearSeqIterator.prototype.init___sc_LinearSeqOps = (function(coll) {
  this.coll$2 = coll;
  this.these$2 = new $c_sc_LinearSeqIterator$LazyCell().init___sc_LinearSeqIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this.coll$2
    })
  })(this)));
  return this
});
$c_sc_LinearSeqIterator.prototype.hasNext__Z = (function() {
  var this$1 = this.these$2.v__sc_LinearSeqOps();
  return $f_sc_IterableOnceOps__nonEmpty__Z(this$1)
});
var $d_sc_LinearSeqIterator = new $TypeData().initClass({
  sc_LinearSeqIterator: 0
}, false, "scala.collection.LinearSeqIterator", {
  sc_LinearSeqIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1
});
$c_sc_LinearSeqIterator.prototype.$classData = $d_sc_LinearSeqIterator;
function $f_sc_MapOps__foreachEntry__F2__V($thiz, f) {
  var it = new $c_sjs_js_WrappedDictionary$DictionaryIterator().init___sjs_js_Dictionary($thiz.dict$4);
  while (it.hasNext__Z()) {
    var next = it.next__T2();
    f.apply__O__O__O(next.$$und1$f, next.$$und2$f)
  }
}
function $f_sc_MapOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder($thiz, sb, start, sep, end) {
  var this$1 = new $c_sjs_js_WrappedDictionary$DictionaryIterator().init___sjs_js_Dictionary($thiz.dict$4);
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x0$1$2) {
      var x0$1 = $as_T2(x0$1$2);
      if ((x0$1 !== null)) {
        var k = x0$1.$$und1$f;
        var v = x0$1.$$und2$f;
        return ((k + " -> ") + v)
      } else {
        throw new $c_s_MatchError().init___O(x0$1)
      }
    })
  })($thiz));
  var this$2 = new $c_sc_Iterator$$anon$9().init___sc_Iterator__F1(this$1, f);
  return $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this$2, sb, start, sep, end)
}
/** @constructor */
function $c_sc_StrictOptimizedLinearSeqOps$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.current$2 = null
}
$c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype.constructor = $c_sc_StrictOptimizedLinearSeqOps$$anon$1;
/** @constructor */
function $h_sc_StrictOptimizedLinearSeqOps$$anon$1() {
  /*<skip>*/
}
$h_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype = $c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype;
$c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype.next__O = (function() {
  var r = this.current$2.head__O();
  this.current$2 = $as_sc_Iterable(this.current$2.tail__O());
  return r
});
$c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype.hasNext__Z = (function() {
  return (!this.current$2.isEmpty__Z())
});
$c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype.init___sc_StrictOptimizedLinearSeqOps = (function($$outer) {
  this.current$2 = $$outer;
  return this
});
var $d_sc_StrictOptimizedLinearSeqOps$$anon$1 = new $TypeData().initClass({
  sc_StrictOptimizedLinearSeqOps$$anon$1: 0
}, false, "scala.collection.StrictOptimizedLinearSeqOps$$anon$1", {
  sc_StrictOptimizedLinearSeqOps$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1
});
$c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype.$classData = $d_sc_StrictOptimizedLinearSeqOps$$anon$1;
function $f_sc_StrictOptimizedSeqOps__prepended__O__O($thiz, elem) {
  var b = $thiz.iterableFactory__sc_SeqFactory().newBuilder__scm_Builder();
  if (($thiz.knownSize__I() >= 0)) {
    b.sizeHint__I__V(((1 + $thiz.length__I()) | 0))
  };
  b.addOne__O__scm_Growable(elem);
  b.addAll__sc_IterableOnce__scm_Growable($thiz);
  return b.result__O()
}
function $f_sc_StrictOptimizedSeqOps__prependedAll__sc_IterableOnce__O($thiz, prefix) {
  var b = $thiz.iterableFactory__sc_SeqFactory().newBuilder__scm_Builder();
  b.addAll__sc_IterableOnce__scm_Growable(prefix);
  b.addAll__sc_IterableOnce__scm_Growable($thiz);
  return b.result__O()
}
/** @constructor */
function $c_sci_IndexedSeq$() {
  $c_sc_SeqFactory$Delegate.call(this)
}
$c_sci_IndexedSeq$.prototype = new $h_sc_SeqFactory$Delegate();
$c_sci_IndexedSeq$.prototype.constructor = $c_sci_IndexedSeq$;
/** @constructor */
function $h_sci_IndexedSeq$() {
  /*<skip>*/
}
$h_sci_IndexedSeq$.prototype = $c_sci_IndexedSeq$.prototype;
$c_sci_IndexedSeq$.prototype.init___ = (function() {
  $c_sc_SeqFactory$Delegate.prototype.init___sc_SeqFactory.call(this, $m_sci_Vector$());
  return this
});
$c_sci_IndexedSeq$.prototype.from__sc_IterableOnce__sci_IndexedSeq = (function(it) {
  if ($is_sci_IndexedSeq(it)) {
    var x2 = $as_sci_IndexedSeq(it);
    return x2
  } else {
    return $as_sci_IndexedSeq($c_sc_SeqFactory$Delegate.prototype.from__sc_IterableOnce__sc_SeqOps.call(this, it))
  }
});
$c_sci_IndexedSeq$.prototype.from__sc_IterableOnce__sc_SeqOps = (function(it) {
  return this.from__sc_IterableOnce__sci_IndexedSeq(it)
});
$c_sci_IndexedSeq$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sci_IndexedSeq(source)
});
var $d_sci_IndexedSeq$ = new $TypeData().initClass({
  sci_IndexedSeq$: 0
}, false, "scala.collection.immutable.IndexedSeq$", {
  sci_IndexedSeq$: 1,
  sc_SeqFactory$Delegate: 1,
  O: 1,
  sc_SeqFactory: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sci_IndexedSeq$.prototype.$classData = $d_sci_IndexedSeq$;
var $n_sci_IndexedSeq$ = (void 0);
function $m_sci_IndexedSeq$() {
  if ((!$n_sci_IndexedSeq$)) {
    $n_sci_IndexedSeq$ = new $c_sci_IndexedSeq$().init___()
  };
  return $n_sci_IndexedSeq$
}
function $is_sci_Iterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Iterable)))
}
function $as_sci_Iterable(obj) {
  return (($is_sci_Iterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Iterable"))
}
function $isArrayOf_sci_Iterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Iterable)))
}
function $asArrayOf_sci_Iterable(obj, depth) {
  return (($isArrayOf_sci_Iterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Iterable;", depth))
}
/** @constructor */
function $c_sci_LazyList$LazyBuilder() {
  $c_O.call(this);
  this.next$1 = null;
  this.list$1 = null
}
$c_sci_LazyList$LazyBuilder.prototype = new $h_O();
$c_sci_LazyList$LazyBuilder.prototype.constructor = $c_sci_LazyList$LazyBuilder;
/** @constructor */
function $h_sci_LazyList$LazyBuilder() {
  /*<skip>*/
}
$h_sci_LazyList$LazyBuilder.prototype = $c_sci_LazyList$LazyBuilder.prototype;
$c_sci_LazyList$LazyBuilder.prototype.addAll__sc_IterableOnce__sci_LazyList$LazyBuilder = (function(xs) {
  if ((xs.knownSize__I() !== 0)) {
    var deferred = new $c_sci_LazyList$LazyBuilder$DeferredState().init___();
    this.next$1.init__F0__V(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, xs$1, deferred$1) {
      return (function() {
        return $m_sci_LazyList$().scala$collection$immutable$LazyList$$stateFromIteratorConcatSuffix__sc_Iterator__F0__sci_LazyList$State(xs$1.iterator__sc_Iterator(), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$1, deferred$3) {
          return (function() {
            return deferred$3.eval__sci_LazyList$State()
          })
        })($this, deferred$1)))
      })
    })(this, xs, deferred)));
    this.next$1 = deferred
  };
  return this
});
$c_sci_LazyList$LazyBuilder.prototype.init___ = (function() {
  this.clear__V();
  return this
});
$c_sci_LazyList$LazyBuilder.prototype.result__O = (function() {
  return this.result__sci_LazyList()
});
$c_sci_LazyList$LazyBuilder.prototype.result__sci_LazyList = (function() {
  this.next$1.init__F0__V(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $m_sci_LazyList$State$Empty$()
    })
  })(this)));
  return this.list$1
});
$c_sci_LazyList$LazyBuilder.prototype.addOne__O__sci_LazyList$LazyBuilder = (function(elem) {
  var deferred = new $c_sci_LazyList$LazyBuilder$DeferredState().init___();
  this.next$1.init__F0__V(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, elem$1, deferred$1) {
    return (function() {
      $m_sci_LazyList$();
      $m_sci_LazyList$();
      var state = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$1, deferred$2) {
        return (function() {
          return deferred$2.eval__sci_LazyList$State()
        })
      })($this, deferred$1));
      var tl = new $c_sci_LazyList().init___F0(state);
      return new $c_sci_LazyList$State$Cons().init___O__sci_LazyList(elem$1, tl)
    })
  })(this, elem, deferred)));
  this.next$1 = deferred;
  return this
});
$c_sci_LazyList$LazyBuilder.prototype.addAll__sc_IterableOnce__scm_Growable = (function(xs) {
  return this.addAll__sc_IterableOnce__sci_LazyList$LazyBuilder(xs)
});
$c_sci_LazyList$LazyBuilder.prototype.addOne__O__scm_Growable = (function(elem) {
  return this.addOne__O__sci_LazyList$LazyBuilder(elem)
});
$c_sci_LazyList$LazyBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sci_LazyList$LazyBuilder.prototype.clear__V = (function() {
  var deferred = new $c_sci_LazyList$LazyBuilder$DeferredState().init___();
  $m_sci_LazyList$();
  var state = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, deferred$1) {
    return (function() {
      return deferred$1.eval__sci_LazyList$State()
    })
  })(this, deferred));
  this.list$1 = new $c_sci_LazyList().init___F0(state);
  this.next$1 = deferred
});
var $d_sci_LazyList$LazyBuilder = new $TypeData().initClass({
  sci_LazyList$LazyBuilder: 0
}, false, "scala.collection.immutable.LazyList$LazyBuilder", {
  sci_LazyList$LazyBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scm_Growable: 1,
  scm_Clearable: 1
});
$c_sci_LazyList$LazyBuilder.prototype.$classData = $d_sci_LazyList$LazyBuilder;
/** @constructor */
function $c_sci_LazyList$LazyIterator() {
  $c_sc_AbstractIterator.call(this);
  this.lazyList$2 = null
}
$c_sci_LazyList$LazyIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_LazyList$LazyIterator.prototype.constructor = $c_sci_LazyList$LazyIterator;
/** @constructor */
function $h_sci_LazyList$LazyIterator() {
  /*<skip>*/
}
$h_sci_LazyList$LazyIterator.prototype = $c_sci_LazyList$LazyIterator.prototype;
$c_sci_LazyList$LazyIterator.prototype.next__O = (function() {
  if (this.lazyList$2.isEmpty__Z()) {
    return $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f.next__O()
  } else {
    var this$1 = this.lazyList$2;
    var res = this$1.scala$collection$immutable$LazyList$$state__sci_LazyList$State().head__O();
    var this$2 = this.lazyList$2;
    this.lazyList$2 = this$2.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList();
    return res
  }
});
$c_sci_LazyList$LazyIterator.prototype.hasNext__Z = (function() {
  return (!this.lazyList$2.isEmpty__Z())
});
$c_sci_LazyList$LazyIterator.prototype.init___sci_LazyList = (function(lazyList) {
  this.lazyList$2 = lazyList;
  return this
});
var $d_sci_LazyList$LazyIterator = new $TypeData().initClass({
  sci_LazyList$LazyIterator: 0
}, false, "scala.collection.immutable.LazyList$LazyIterator", {
  sci_LazyList$LazyIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1
});
$c_sci_LazyList$LazyIterator.prototype.$classData = $d_sci_LazyList$LazyIterator;
/** @constructor */
function $c_sci_List$() {
  $c_O.call(this);
  this.scala$collection$immutable$List$$TupleOfNil$1 = null;
  this.partialNotApplied$1 = null
}
$c_sci_List$.prototype = new $h_O();
$c_sci_List$.prototype.constructor = $c_sci_List$;
/** @constructor */
function $h_sci_List$() {
  /*<skip>*/
}
$h_sci_List$.prototype = $c_sci_List$.prototype;
$c_sci_List$.prototype.init___ = (function() {
  $n_sci_List$ = this;
  this.scala$collection$immutable$List$$TupleOfNil$1 = new $c_T2().init___O__O($m_sci_Nil$(), $m_sci_Nil$());
  this.partialNotApplied$1 = new $c_sci_List$$anon$1().init___();
  return this
});
$c_sci_List$.prototype.from__sc_IterableOnce__O = (function(source) {
  return $m_sci_Nil$().prependedAll__sc_IterableOnce__sci_List(source)
});
$c_sci_List$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
$c_sci_List$.prototype.apply__sci_Seq__O = (function(elems) {
  return $m_sci_Nil$().prependedAll__sc_IterableOnce__sci_List(elems)
});
var $d_sci_List$ = new $TypeData().initClass({
  sci_List$: 0
}, false, "scala.collection.immutable.List$", {
  sci_List$: 1,
  O: 1,
  sc_StrictOptimizedSeqFactory: 1,
  sc_SeqFactory: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sci_List$.prototype.$classData = $d_sci_List$;
var $n_sci_List$ = (void 0);
function $m_sci_List$() {
  if ((!$n_sci_List$)) {
    $n_sci_List$ = new $c_sci_List$().init___()
  };
  return $n_sci_List$
}
/** @constructor */
function $c_sci_NewVectorIterator() {
  $c_O.call(this);
  this.v$1 = null;
  this.totalLength$1 = 0;
  this.sliceCount$1 = 0;
  this.a1$1 = null;
  this.a2$1 = null;
  this.a3$1 = null;
  this.a4$1 = null;
  this.a5$1 = null;
  this.a6$1 = null;
  this.a1len$1 = 0;
  this.scala$collection$immutable$NewVectorIterator$$i1$f = 0;
  this.oldPos$1 = 0;
  this.scala$collection$immutable$NewVectorIterator$$len1$f = 0;
  this.sliceIdx$1 = 0;
  this.sliceDim$1 = 0;
  this.sliceStart$1 = 0;
  this.sliceEnd$1 = 0
}
$c_sci_NewVectorIterator.prototype = new $h_O();
$c_sci_NewVectorIterator.prototype.constructor = $c_sci_NewVectorIterator;
/** @constructor */
function $h_sci_NewVectorIterator() {
  /*<skip>*/
}
$h_sci_NewVectorIterator.prototype = $c_sci_NewVectorIterator.prototype;
$c_sci_NewVectorIterator.prototype.next__O = (function() {
  if ((this.scala$collection$immutable$NewVectorIterator$$i1$f === this.a1len$1)) {
    this.advance__p1__V()
  };
  var r = this.a1$1.get(this.scala$collection$immutable$NewVectorIterator$$i1$f);
  this.scala$collection$immutable$NewVectorIterator$$i1$f = ((1 + this.scala$collection$immutable$NewVectorIterator$$i1$f) | 0);
  return r
});
$c_sci_NewVectorIterator.prototype.concat__F0__sc_Iterator = (function(xs) {
  return $f_sc_Iterator__concat__F0__sc_Iterator(this, xs)
});
$c_sci_NewVectorIterator.prototype.isEmpty__Z = (function() {
  return $f_sc_Iterator__isEmpty__Z(this)
});
$c_sci_NewVectorIterator.prototype.toString__T = (function() {
  return "<iterator>"
});
$c_sci_NewVectorIterator.prototype.foreach__F1__V = (function(f) {
  $f_sc_IterableOnceOps__foreach__F1__V(this, f)
});
$c_sci_NewVectorIterator.prototype.advance__p1__V = (function() {
  var pos = ((((this.scala$collection$immutable$NewVectorIterator$$i1$f - this.scala$collection$immutable$NewVectorIterator$$len1$f) | 0) + this.totalLength$1) | 0);
  if ((pos === this.sliceEnd$1)) {
    this.advanceSlice__p1__V()
  };
  if ((this.sliceDim$1 > 1)) {
    var io = ((pos - this.sliceStart$1) | 0);
    var xor = (this.oldPos$1 ^ io);
    this.advanceA__p1__I__I__V(io, xor);
    this.oldPos$1 = io
  };
  this.scala$collection$immutable$NewVectorIterator$$len1$f = ((this.scala$collection$immutable$NewVectorIterator$$len1$f - this.scala$collection$immutable$NewVectorIterator$$i1$f) | 0);
  var a = this.a1$1.u.length;
  var b = this.scala$collection$immutable$NewVectorIterator$$len1$f;
  this.a1len$1 = ((a < b) ? a : b);
  this.scala$collection$immutable$NewVectorIterator$$i1$f = 0
});
$c_sci_NewVectorIterator.prototype.advanceSlice__p1__V = (function() {
  if ((!(this.scala$collection$immutable$NewVectorIterator$$len1$f > this.scala$collection$immutable$NewVectorIterator$$i1$f))) {
    $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f.next__O()
  };
  this.sliceIdx$1 = ((1 + this.sliceIdx$1) | 0);
  var slice = this.v$1.vectorSlice__I__AO(this.sliceIdx$1);
  while ((slice.u.length === 0)) {
    this.sliceIdx$1 = ((1 + this.sliceIdx$1) | 0);
    slice = this.v$1.vectorSlice__I__AO(this.sliceIdx$1)
  };
  this.sliceStart$1 = this.sliceEnd$1;
  var count = this.sliceCount$1;
  var idx = this.sliceIdx$1;
  var c = ((count / 2) | 0);
  var a = ((idx - c) | 0);
  this.sliceDim$1 = ((((1 + c) | 0) - ((a < 0) ? ((-a) | 0) : a)) | 0);
  var x1 = this.sliceDim$1;
  switch (x1) {
    case 1: {
      this.a1$1 = slice;
      break
    }
    case 2: {
      this.a2$1 = $asArrayOf_O(slice, 2);
      break
    }
    case 3: {
      this.a3$1 = $asArrayOf_O(slice, 3);
      break
    }
    case 4: {
      this.a4$1 = $asArrayOf_O(slice, 4);
      break
    }
    case 5: {
      this.a5$1 = $asArrayOf_O(slice, 5);
      break
    }
    case 6: {
      this.a6$1 = $asArrayOf_O(slice, 6);
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  };
  this.sliceEnd$1 = ((this.sliceStart$1 + $imul(slice.u.length, (1 << $imul(5, (((-1) + this.sliceDim$1) | 0))))) | 0);
  if ((this.sliceEnd$1 > this.totalLength$1)) {
    this.sliceEnd$1 = this.totalLength$1
  };
  if ((this.sliceDim$1 > 1)) {
    this.oldPos$1 = (((-1) + (1 << $imul(5, this.sliceDim$1))) | 0)
  }
});
$c_sci_NewVectorIterator.prototype.iterator__sc_Iterator = (function() {
  return this
});
$c_sci_NewVectorIterator.prototype.setA__p1__I__I__V = (function(io, xor) {
  if ((xor < 1024)) {
    this.a1$1 = this.a2$1.get((31 & ((io >>> 5) | 0)))
  } else if ((xor < 32768)) {
    this.a2$1 = this.a3$1.get((31 & ((io >>> 10) | 0)));
    this.a1$1 = this.a2$1.get((31 & ((io >>> 5) | 0)))
  } else if ((xor < 1048576)) {
    this.a3$1 = this.a4$1.get((31 & ((io >>> 15) | 0)));
    this.a2$1 = this.a3$1.get((31 & ((io >>> 10) | 0)));
    this.a1$1 = this.a2$1.get((31 & ((io >>> 5) | 0)))
  } else if ((xor < 33554432)) {
    this.a4$1 = this.a5$1.get((31 & ((io >>> 20) | 0)));
    this.a3$1 = this.a4$1.get((31 & ((io >>> 15) | 0)));
    this.a2$1 = this.a3$1.get((31 & ((io >>> 10) | 0)));
    this.a1$1 = this.a2$1.get((31 & ((io >>> 5) | 0)))
  } else {
    this.a5$1 = this.a6$1.get(((io >>> 25) | 0));
    this.a4$1 = this.a5$1.get((31 & ((io >>> 20) | 0)));
    this.a3$1 = this.a4$1.get((31 & ((io >>> 15) | 0)));
    this.a2$1 = this.a3$1.get((31 & ((io >>> 10) | 0)));
    this.a1$1 = this.a2$1.get((31 & ((io >>> 5) | 0)))
  }
});
$c_sci_NewVectorIterator.prototype.hasNext__Z = (function() {
  return (this.scala$collection$immutable$NewVectorIterator$$len1$f > this.scala$collection$immutable$NewVectorIterator$$i1$f)
});
$c_sci_NewVectorIterator.prototype.advanceA__p1__I__I__V = (function(io, xor) {
  if ((xor < 1024)) {
    this.a1$1 = this.a2$1.get((31 & ((io >>> 5) | 0)))
  } else if ((xor < 32768)) {
    this.a2$1 = this.a3$1.get((31 & ((io >>> 10) | 0)));
    this.a1$1 = this.a2$1.get(0)
  } else if ((xor < 1048576)) {
    this.a3$1 = this.a4$1.get((31 & ((io >>> 15) | 0)));
    this.a2$1 = this.a3$1.get(0);
    this.a1$1 = this.a2$1.get(0)
  } else if ((xor < 33554432)) {
    this.a4$1 = this.a5$1.get((31 & ((io >>> 20) | 0)));
    this.a3$1 = this.a4$1.get(0);
    this.a2$1 = this.a3$1.get(0);
    this.a1$1 = this.a2$1.get(0)
  } else {
    this.a5$1 = this.a6$1.get(((io >>> 25) | 0));
    this.a4$1 = this.a5$1.get(0);
    this.a3$1 = this.a4$1.get(0);
    this.a2$1 = this.a3$1.get(0);
    this.a1$1 = this.a2$1.get(0)
  }
});
$c_sci_NewVectorIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sci_NewVectorIterator.prototype.drop__I__sc_Iterator = (function(n) {
  if ((n > 0)) {
    var oldpos = ((((this.scala$collection$immutable$NewVectorIterator$$i1$f - this.scala$collection$immutable$NewVectorIterator$$len1$f) | 0) + this.totalLength$1) | 0);
    var a = ((oldpos + n) | 0);
    var b = this.totalLength$1;
    var newpos = ((a < b) ? a : b);
    if ((newpos === this.totalLength$1)) {
      this.scala$collection$immutable$NewVectorIterator$$i1$f = 0;
      this.scala$collection$immutable$NewVectorIterator$$len1$f = 0;
      this.a1len$1 = 0
    } else {
      while ((newpos >= this.sliceEnd$1)) {
        this.advanceSlice__p1__V()
      };
      var io = ((newpos - this.sliceStart$1) | 0);
      if ((this.sliceDim$1 > 1)) {
        var xor = (this.oldPos$1 ^ io);
        this.setA__p1__I__I__V(io, xor);
        this.oldPos$1 = io
      };
      this.a1len$1 = this.a1$1.u.length;
      this.scala$collection$immutable$NewVectorIterator$$i1$f = (31 & io);
      this.scala$collection$immutable$NewVectorIterator$$len1$f = ((this.scala$collection$immutable$NewVectorIterator$$i1$f + ((this.totalLength$1 - newpos) | 0)) | 0);
      if ((this.a1len$1 > this.scala$collection$immutable$NewVectorIterator$$len1$f)) {
        this.a1len$1 = this.scala$collection$immutable$NewVectorIterator$$len1$f
      }
    }
  };
  return this
});
$c_sci_NewVectorIterator.prototype.knownSize__I = (function() {
  return ((this.scala$collection$immutable$NewVectorIterator$$len1$f - this.scala$collection$immutable$NewVectorIterator$$i1$f) | 0)
});
$c_sci_NewVectorIterator.prototype.init___sci_Vector__I__I = (function(v, totalLength, sliceCount) {
  this.v$1 = v;
  this.totalLength$1 = totalLength;
  this.sliceCount$1 = sliceCount;
  this.a1$1 = v.prefix1$4;
  this.a1len$1 = this.a1$1.u.length;
  this.scala$collection$immutable$NewVectorIterator$$i1$f = 0;
  this.oldPos$1 = 0;
  this.scala$collection$immutable$NewVectorIterator$$len1$f = this.totalLength$1;
  this.sliceIdx$1 = 0;
  this.sliceDim$1 = 1;
  this.sliceStart$1 = 0;
  this.sliceEnd$1 = this.a1len$1;
  return this
});
var $d_sci_NewVectorIterator = new $TypeData().initClass({
  sci_NewVectorIterator: 0
}, false, "scala.collection.immutable.NewVectorIterator", {
  sci_NewVectorIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  jl_Cloneable: 1
});
$c_sci_NewVectorIterator.prototype.$classData = $d_sci_NewVectorIterator;
/** @constructor */
function $c_sci_Seq$() {
  $c_sc_SeqFactory$Delegate.call(this)
}
$c_sci_Seq$.prototype = new $h_sc_SeqFactory$Delegate();
$c_sci_Seq$.prototype.constructor = $c_sci_Seq$;
/** @constructor */
function $h_sci_Seq$() {
  /*<skip>*/
}
$h_sci_Seq$.prototype = $c_sci_Seq$.prototype;
$c_sci_Seq$.prototype.init___ = (function() {
  $c_sc_SeqFactory$Delegate.prototype.init___sc_SeqFactory.call(this, $m_sci_List$());
  return this
});
$c_sci_Seq$.prototype.from__sc_IterableOnce__sci_Seq = (function(it) {
  if ($is_sci_Seq(it)) {
    var x2 = $as_sci_Seq(it);
    return x2
  } else {
    return $as_sci_Seq($c_sc_SeqFactory$Delegate.prototype.from__sc_IterableOnce__sc_SeqOps.call(this, it))
  }
});
$c_sci_Seq$.prototype.from__sc_IterableOnce__sc_SeqOps = (function(it) {
  return this.from__sc_IterableOnce__sci_Seq(it)
});
$c_sci_Seq$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sci_Seq(source)
});
var $d_sci_Seq$ = new $TypeData().initClass({
  sci_Seq$: 0
}, false, "scala.collection.immutable.Seq$", {
  sci_Seq$: 1,
  sc_SeqFactory$Delegate: 1,
  O: 1,
  sc_SeqFactory: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Seq$.prototype.$classData = $d_sci_Seq$;
var $n_sci_Seq$ = (void 0);
function $m_sci_Seq$() {
  if ((!$n_sci_Seq$)) {
    $n_sci_Seq$ = new $c_sci_Seq$().init___()
  };
  return $n_sci_Seq$
}
/** @constructor */
function $c_sci_Vector$() {
  $c_O.call(this);
  this.scala$collection$immutable$Vector$$defaultApplyPreferredMaxLength$1 = 0;
  this.scala$collection$immutable$Vector$$emptyIterator$1 = null
}
$c_sci_Vector$.prototype = new $h_O();
$c_sci_Vector$.prototype.constructor = $c_sci_Vector$;
/** @constructor */
function $h_sci_Vector$() {
  /*<skip>*/
}
$h_sci_Vector$.prototype = $c_sci_Vector$.prototype;
$c_sci_Vector$.prototype.init___ = (function() {
  $n_sci_Vector$ = this;
  this.scala$collection$immutable$Vector$$defaultApplyPreferredMaxLength$1 = this.liftedTree1$1__p1__I();
  this.scala$collection$immutable$Vector$$emptyIterator$1 = new $c_sci_NewVectorIterator().init___sci_Vector__I__I($m_sci_Vector0$(), 0, 0);
  return this
});
$c_sci_Vector$.prototype.liftedTree1$1__p1__I = (function() {
  try {
    $m_jl_System$();
    var x = $m_jl_System$SystemProperties$().value$1.getProperty__T__T__T("scala.collection.immutable.Vector.defaultApplyPreferredMaxLength", "250");
    var this$4 = $m_jl_Integer$();
    return this$4.parseInt__T__I__I(x, 10)
  } catch (e) {
    if ((e instanceof $c_jl_SecurityException)) {
      return 250
    } else {
      throw e
    }
  }
});
$c_sci_Vector$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sci_Vector(source)
});
$c_sci_Vector$.prototype.from__sc_IterableOnce__sci_Vector = (function(it) {
  if ((it instanceof $c_sci_Vector)) {
    var x2 = $as_sci_Vector(it);
    return x2
  } else {
    var knownSize = it.knownSize__I();
    if ((knownSize === 0)) {
      return $m_sci_Vector0$()
    } else if (((knownSize > 0) && (knownSize <= 32))) {
      matchEnd5: {
        var a1$3;
        if ((it instanceof $c_sci_ArraySeq$ofRef)) {
          var x2$2 = $as_sci_ArraySeq$ofRef(it);
          var x = x2$2.elemTag__s_reflect_ClassTag();
          if (((x !== null) && x.equals__O__Z($d_O.getClassOf()))) {
            var a1$3 = x2$2.unsafeArray__AO();
            break matchEnd5
          }
        };
        if ($is_sci_Iterable(it)) {
          var x3 = $as_sci_Iterable(it);
          var a1 = $newArrayObject($d_O.getArrayOf(), [knownSize]);
          x3.copyToArray__O__I__I(a1, 0);
          var a1$3 = a1;
          break matchEnd5
        };
        var a1$2 = $newArrayObject($d_O.getArrayOf(), [knownSize]);
        var this$1 = it.iterator__sc_Iterator();
        $f_sc_IterableOnceOps__copyToArray__O__I__I(this$1, a1$2, 0);
        var a1$3 = a1$2
      };
      return new $c_sci_Vector1().init___AO(a1$3)
    } else {
      var this$2 = new $c_sci_VectorBuilder().init___();
      var this$3 = this$2.addAll__sc_IterableOnce__sci_VectorBuilder(it);
      return this$3.result__sci_Vector()
    }
  }
});
$c_sci_Vector$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_VectorBuilder().init___()
});
$c_sci_Vector$.prototype.apply__sci_Seq__O = (function(elems) {
  return this.from__sc_IterableOnce__sci_Vector(elems)
});
var $d_sci_Vector$ = new $TypeData().initClass({
  sci_Vector$: 0
}, false, "scala.collection.immutable.Vector$", {
  sci_Vector$: 1,
  O: 1,
  sc_StrictOptimizedSeqFactory: 1,
  sc_SeqFactory: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector$.prototype.$classData = $d_sci_Vector$;
var $n_sci_Vector$ = (void 0);
function $m_sci_Vector$() {
  if ((!$n_sci_Vector$)) {
    $n_sci_Vector$ = new $c_sci_Vector$().init___()
  };
  return $n_sci_Vector$
}
/** @constructor */
function $c_sci_VectorBuilder() {
  $c_O.call(this);
  this.a6$1 = null;
  this.a5$1 = null;
  this.a4$1 = null;
  this.a3$1 = null;
  this.a2$1 = null;
  this.a1$1 = null;
  this.scala$collection$immutable$VectorBuilder$$len1$f = 0;
  this.scala$collection$immutable$VectorBuilder$$lenRest$f = 0;
  this.offset$1 = 0;
  this.depth$1 = 0
}
$c_sci_VectorBuilder.prototype = new $h_O();
$c_sci_VectorBuilder.prototype.constructor = $c_sci_VectorBuilder;
/** @constructor */
function $h_sci_VectorBuilder() {
  /*<skip>*/
}
$h_sci_VectorBuilder.prototype = $c_sci_VectorBuilder.prototype;
$c_sci_VectorBuilder.prototype.init___ = (function() {
  this.a1$1 = $newArrayObject($d_O.getArrayOf(), [32]);
  this.scala$collection$immutable$VectorBuilder$$len1$f = 0;
  this.scala$collection$immutable$VectorBuilder$$lenRest$f = 0;
  this.offset$1 = 0;
  this.depth$1 = 1;
  return this
});
$c_sci_VectorBuilder.prototype.addOne__O__sci_VectorBuilder = (function(elem) {
  if ((this.scala$collection$immutable$VectorBuilder$$len1$f === 32)) {
    this.advance__p1__V()
  };
  this.a1$1.set(this.scala$collection$immutable$VectorBuilder$$len1$f, elem);
  this.scala$collection$immutable$VectorBuilder$$len1$f = ((1 + this.scala$collection$immutable$VectorBuilder$$len1$f) | 0);
  return this
});
$c_sci_VectorBuilder.prototype.advance1__p1__I__I__V = (function(idx, xor) {
  if ((xor < 1024)) {
    if ((this.depth$1 === 1)) {
      this.a2$1 = $newArrayObject($d_O.getArrayOf().getArrayOf(), [32]);
      this.a2$1.set(0, this.a1$1);
      this.depth$1 = ((1 + this.depth$1) | 0)
    };
    this.a1$1 = $newArrayObject($d_O.getArrayOf(), [32]);
    this.a2$1.set((31 & ((idx >>> 5) | 0)), this.a1$1)
  } else if ((xor < 32768)) {
    if ((this.depth$1 === 2)) {
      this.a3$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf(), [32]);
      this.a3$1.set(0, this.a2$1);
      this.depth$1 = ((1 + this.depth$1) | 0)
    };
    this.a1$1 = $newArrayObject($d_O.getArrayOf(), [32]);
    this.a2$1 = $newArrayObject($d_O.getArrayOf().getArrayOf(), [32]);
    this.a2$1.set((31 & ((idx >>> 5) | 0)), this.a1$1);
    this.a3$1.set((31 & ((idx >>> 10) | 0)), this.a2$1)
  } else if ((xor < 1048576)) {
    if ((this.depth$1 === 3)) {
      this.a4$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [32]);
      this.a4$1.set(0, this.a3$1);
      this.depth$1 = ((1 + this.depth$1) | 0)
    };
    this.a1$1 = $newArrayObject($d_O.getArrayOf(), [32]);
    this.a2$1 = $newArrayObject($d_O.getArrayOf().getArrayOf(), [32]);
    this.a3$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf(), [32]);
    this.a2$1.set((31 & ((idx >>> 5) | 0)), this.a1$1);
    this.a3$1.set((31 & ((idx >>> 10) | 0)), this.a2$1);
    this.a4$1.set((31 & ((idx >>> 15) | 0)), this.a3$1)
  } else if ((xor < 33554432)) {
    if ((this.depth$1 === 4)) {
      this.a5$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [32]);
      this.a5$1.set(0, this.a4$1);
      this.depth$1 = ((1 + this.depth$1) | 0)
    };
    this.a1$1 = $newArrayObject($d_O.getArrayOf(), [32]);
    this.a2$1 = $newArrayObject($d_O.getArrayOf().getArrayOf(), [32]);
    this.a3$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf(), [32]);
    this.a4$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [32]);
    this.a2$1.set((31 & ((idx >>> 5) | 0)), this.a1$1);
    this.a3$1.set((31 & ((idx >>> 10) | 0)), this.a2$1);
    this.a4$1.set((31 & ((idx >>> 15) | 0)), this.a3$1);
    this.a5$1.set((31 & ((idx >>> 20) | 0)), this.a4$1)
  } else if ((xor < 1073741824)) {
    if ((this.depth$1 === 5)) {
      this.a6$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [64]);
      this.a6$1.set(0, this.a5$1);
      this.depth$1 = ((1 + this.depth$1) | 0)
    };
    this.a1$1 = $newArrayObject($d_O.getArrayOf(), [32]);
    this.a2$1 = $newArrayObject($d_O.getArrayOf().getArrayOf(), [32]);
    this.a3$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf(), [32]);
    this.a4$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [32]);
    this.a5$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [32]);
    this.a2$1.set((31 & ((idx >>> 5) | 0)), this.a1$1);
    this.a3$1.set((31 & ((idx >>> 10) | 0)), this.a2$1);
    this.a4$1.set((31 & ((idx >>> 15) | 0)), this.a3$1);
    this.a5$1.set((31 & ((idx >>> 20) | 0)), this.a4$1);
    this.a6$1.set((31 & ((idx >>> 25) | 0)), this.a5$1)
  } else {
    throw new $c_jl_IllegalArgumentException().init___T(((((((((((((((((("advance1(" + idx) + ", ") + xor) + "): a1=") + this.a1$1) + ", a2=") + this.a2$1) + ", a3=") + this.a3$1) + ", a4=") + this.a4$1) + ", a5=") + this.a5$1) + ", a6=") + this.a6$1) + ", depth=") + this.depth$1))
  }
});
$c_sci_VectorBuilder.prototype.addArr1__p1__AO__V = (function(data) {
  var dl = data.u.length;
  if ((dl > 0)) {
    if ((this.scala$collection$immutable$VectorBuilder$$len1$f === 32)) {
      this.advance__p1__V()
    };
    var a = ((32 - this.scala$collection$immutable$VectorBuilder$$len1$f) | 0);
    var copy1 = ((a < dl) ? a : dl);
    var copy2 = ((dl - copy1) | 0);
    $systemArraycopy(data, 0, this.a1$1, this.scala$collection$immutable$VectorBuilder$$len1$f, copy1);
    this.scala$collection$immutable$VectorBuilder$$len1$f = ((this.scala$collection$immutable$VectorBuilder$$len1$f + copy1) | 0);
    if ((copy2 > 0)) {
      this.advance__p1__V();
      $systemArraycopy(data, copy1, this.a1$1, 0, copy2);
      this.scala$collection$immutable$VectorBuilder$$len1$f = ((this.scala$collection$immutable$VectorBuilder$$len1$f + copy2) | 0)
    }
  }
});
$c_sci_VectorBuilder.prototype.toString__T = (function() {
  return (((((((("VectorBuilder(len1=" + this.scala$collection$immutable$VectorBuilder$$len1$f) + ", lenRest=") + this.scala$collection$immutable$VectorBuilder$$lenRest$f) + ", offset=") + this.offset$1) + ", depth=") + this.depth$1) + ")")
});
$c_sci_VectorBuilder.prototype.advance__p1__V = (function() {
  var idx = ((32 + this.scala$collection$immutable$VectorBuilder$$lenRest$f) | 0);
  var xor = (idx ^ this.scala$collection$immutable$VectorBuilder$$lenRest$f);
  this.scala$collection$immutable$VectorBuilder$$lenRest$f = idx;
  this.scala$collection$immutable$VectorBuilder$$len1$f = 0;
  this.advance1__p1__I__I__V(idx, xor)
});
$c_sci_VectorBuilder.prototype.result__O = (function() {
  return this.result__sci_Vector()
});
$c_sci_VectorBuilder.prototype.initFrom__sci_Vector__sci_VectorBuilder = (function(v) {
  var x1 = v.vectorSliceCount__I();
  switch (x1) {
    case 0: {
      break
    }
    case 1: {
      var v1 = $as_sci_Vector1(v);
      this.depth$1 = 1;
      var i = v1.prefix1$4.u.length;
      this.scala$collection$immutable$VectorBuilder$$len1$f = (31 & i);
      this.scala$collection$immutable$VectorBuilder$$lenRest$f = ((i - this.scala$collection$immutable$VectorBuilder$$len1$f) | 0);
      var a = v1.prefix1$4;
      this.a1$1 = ((a.u.length === 32) ? a : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a, 0, 32));
      break
    }
    case 3: {
      var v2 = $as_sci_Vector2(v);
      var d2 = v2.data2$7;
      var a$1 = v2.suffix1$6;
      this.a1$1 = ((a$1.u.length === 32) ? a$1 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$1, 0, 32));
      this.depth$1 = 2;
      this.offset$1 = ((32 - v2.len1$7) | 0);
      var i$1 = ((v2.length0$6 + this.offset$1) | 0);
      this.scala$collection$immutable$VectorBuilder$$len1$f = (31 & i$1);
      this.scala$collection$immutable$VectorBuilder$$lenRest$f = ((i$1 - this.scala$collection$immutable$VectorBuilder$$len1$f) | 0);
      this.a2$1 = $newArrayObject($d_O.getArrayOf().getArrayOf(), [32]);
      this.a2$1.set(0, v2.prefix1$4);
      $systemArraycopy(d2, 0, this.a2$1, 1, d2.u.length);
      this.a2$1.set(((1 + d2.u.length) | 0), this.a1$1);
      break
    }
    case 5: {
      var v3 = $as_sci_Vector3(v);
      var d3 = v3.data3$7;
      var s2 = v3.suffix2$7;
      var a$2 = v3.suffix1$6;
      this.a1$1 = ((a$2.u.length === 32) ? a$2 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$2, 0, 32));
      this.depth$1 = 3;
      this.offset$1 = ((1024 - v3.len12$7) | 0);
      var i$2 = ((v3.length0$6 + this.offset$1) | 0);
      this.scala$collection$immutable$VectorBuilder$$len1$f = (31 & i$2);
      this.scala$collection$immutable$VectorBuilder$$lenRest$f = ((i$2 - this.scala$collection$immutable$VectorBuilder$$len1$f) | 0);
      this.a3$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf(), [32]);
      this.a3$1.set(0, $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO(v3.prefix1$4, v3.prefix2$7), 2));
      $systemArraycopy(d3, 0, this.a3$1, 1, d3.u.length);
      this.a2$1 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s2, 32), 2);
      this.a3$1.set(((1 + d3.u.length) | 0), this.a2$1);
      this.a2$1.set(s2.u.length, this.a1$1);
      break
    }
    case 7: {
      var v4 = $as_sci_Vector4(v);
      var d4 = v4.data4$7;
      var s3 = v4.suffix3$7;
      var s2$2 = v4.suffix2$7;
      var a$3 = v4.suffix1$6;
      this.a1$1 = ((a$3.u.length === 32) ? a$3 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$3, 0, 32));
      this.depth$1 = 4;
      this.offset$1 = ((32768 - v4.len123$7) | 0);
      var i$3 = ((v4.length0$6 + this.offset$1) | 0);
      this.scala$collection$immutable$VectorBuilder$$len1$f = (31 & i$3);
      this.scala$collection$immutable$VectorBuilder$$lenRest$f = ((i$3 - this.scala$collection$immutable$VectorBuilder$$len1$f) | 0);
      this.a4$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [32]);
      this.a4$1.set(0, $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(v4.prefix1$4, v4.prefix2$7), v4.prefix3$7), 3));
      $systemArraycopy(d4, 0, this.a4$1, 1, d4.u.length);
      this.a3$1 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s3, 32), 3);
      this.a2$1 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s2$2, 32), 2);
      this.a4$1.set(((1 + d4.u.length) | 0), this.a3$1);
      this.a3$1.set(s3.u.length, this.a2$1);
      this.a2$1.set(s2$2.u.length, this.a1$1);
      break
    }
    case 9: {
      var v5 = $as_sci_Vector5(v);
      var d5 = v5.data5$7;
      var s4 = v5.suffix4$7;
      var s3$2 = v5.suffix3$7;
      var s2$3 = v5.suffix2$7;
      var a$4 = v5.suffix1$6;
      this.a1$1 = ((a$4.u.length === 32) ? a$4 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$4, 0, 32));
      this.depth$1 = 5;
      this.offset$1 = ((1048576 - v5.len1234$7) | 0);
      var i$4 = ((v5.length0$6 + this.offset$1) | 0);
      this.scala$collection$immutable$VectorBuilder$$len1$f = (31 & i$4);
      this.scala$collection$immutable$VectorBuilder$$lenRest$f = ((i$4 - this.scala$collection$immutable$VectorBuilder$$len1$f) | 0);
      this.a5$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [32]);
      this.a5$1.set(0, $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(v5.prefix1$4, v5.prefix2$7), v5.prefix3$7), v5.prefix4$7), 4));
      $systemArraycopy(d5, 0, this.a5$1, 1, d5.u.length);
      this.a4$1 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s4, 32), 4);
      this.a3$1 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s3$2, 32), 3);
      this.a2$1 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s2$3, 32), 2);
      this.a5$1.set(((1 + d5.u.length) | 0), this.a4$1);
      this.a4$1.set(s4.u.length, this.a3$1);
      this.a3$1.set(s3$2.u.length, this.a2$1);
      this.a2$1.set(s2$3.u.length, this.a1$1);
      break
    }
    case 11: {
      var v6 = $as_sci_Vector6(v);
      var d6 = v6.data6$7;
      var s5 = v6.suffix5$7;
      var s4$2 = v6.suffix4$7;
      var s3$3 = v6.suffix3$7;
      var s2$4 = v6.suffix2$7;
      var a$5 = v6.suffix1$6;
      this.a1$1 = ((a$5.u.length === 32) ? a$5 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$5, 0, 32));
      this.depth$1 = 6;
      this.offset$1 = ((33554432 - v6.len12345$7) | 0);
      var i$5 = ((v6.length0$6 + this.offset$1) | 0);
      this.scala$collection$immutable$VectorBuilder$$len1$f = (31 & i$5);
      this.scala$collection$immutable$VectorBuilder$$lenRest$f = ((i$5 - this.scala$collection$immutable$VectorBuilder$$len1$f) | 0);
      this.a6$1 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [32]);
      this.a6$1.set(0, $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(v6.prefix1$4, v6.prefix2$7), v6.prefix3$7), v6.prefix4$7), v6.prefix5$7), 5));
      $systemArraycopy(d6, 0, this.a6$1, 1, d6.u.length);
      this.a5$1 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s5, 32), 5);
      this.a4$1 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s4$2, 32), 4);
      this.a3$1 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s3$3, 32), 3);
      this.a2$1 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s2$4, 32), 2);
      this.a6$1.set(((1 + d6.u.length) | 0), this.a5$1);
      this.a5$1.set(s5.u.length, this.a4$1);
      this.a4$1.set(s4$2.u.length, this.a3$1);
      this.a3$1.set(s3$3.u.length, this.a2$1);
      this.a2$1.set(s2$4.u.length, this.a1$1);
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  };
  if (((this.scala$collection$immutable$VectorBuilder$$len1$f === 0) && (this.scala$collection$immutable$VectorBuilder$$lenRest$f > 0))) {
    this.scala$collection$immutable$VectorBuilder$$len1$f = 32;
    this.scala$collection$immutable$VectorBuilder$$lenRest$f = (((-32) + this.scala$collection$immutable$VectorBuilder$$lenRest$f) | 0)
  };
  return this
});
$c_sci_VectorBuilder.prototype.addAll__sc_IterableOnce__scm_Growable = (function(xs) {
  return this.addAll__sc_IterableOnce__sci_VectorBuilder(xs)
});
$c_sci_VectorBuilder.prototype.addAll__sc_IterableOnce__sci_VectorBuilder = (function(xs) {
  if ((xs instanceof $c_sci_Vector)) {
    var x2 = $as_sci_Vector(xs);
    return (((this.scala$collection$immutable$VectorBuilder$$len1$f === 0) && (this.scala$collection$immutable$VectorBuilder$$lenRest$f === 0)) ? this.initFrom__sci_Vector__sci_VectorBuilder(x2) : this.addVector__p1__sci_Vector__sci_VectorBuilder(x2))
  } else {
    return $as_sci_VectorBuilder($f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this, xs))
  }
});
$c_sci_VectorBuilder.prototype.result__sci_Vector = (function() {
  var len = ((this.scala$collection$immutable$VectorBuilder$$len1$f + this.scala$collection$immutable$VectorBuilder$$lenRest$f) | 0);
  var realLen = ((len - this.offset$1) | 0);
  if ((realLen === 0)) {
    $m_sci_Vector$();
    return $m_sci_Vector0$()
  } else if ((len <= 32)) {
    return ((realLen === 32) ? new $c_sci_Vector1().init___AO(this.a1$1) : new $c_sci_Vector1().init___AO($m_ju_Arrays$().copyOf__AO__I__AO(this.a1$1, realLen)))
  } else if ((len <= 1024)) {
    var i1 = (31 & (((-1) + len) | 0));
    var i2 = (((((-1) + len) | 0) >>> 5) | 0);
    var data = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(this.a2$1, 1, i2), 2);
    var prefix1 = this.a2$1.get(0);
    var a = this.a2$1.get(i2);
    var len$1 = ((1 + i1) | 0);
    var suffix1 = ((a.u.length === len$1) ? a : $m_ju_Arrays$().copyOf__AO__I__AO(a, len$1));
    return new $c_sci_Vector2().init___AO__I__AAO__AO__I(prefix1, ((32 - this.offset$1) | 0), data, suffix1, realLen)
  } else if ((len <= 32768)) {
    var i1$2 = (31 & (((-1) + len) | 0));
    var i2$2 = (31 & (((((-1) + len) | 0) >>> 5) | 0));
    var i3 = (((((-1) + len) | 0) >>> 10) | 0);
    var data$2 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(this.a3$1, 1, i3), 3);
    var a$1 = this.a3$1.get(0);
    var prefix2 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$1, 1, a$1.u.length), 2);
    var prefix1$2 = this.a3$1.get(0).get(0);
    var suffix2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(this.a3$1.get(i3), i2$2), 2);
    var a$2 = this.a3$1.get(i3).get(i2$2);
    var len$2 = ((1 + i1$2) | 0);
    var suffix1$2 = ((a$2.u.length === len$2) ? a$2 : $m_ju_Arrays$().copyOf__AO__I__AO(a$2, len$2));
    var len1 = prefix1$2.u.length;
    var len12 = ((len1 + (prefix2.u.length << 5)) | 0);
    return new $c_sci_Vector3().init___AO__I__AAO__I__AAAO__AAO__AO__I(prefix1$2, len1, prefix2, len12, data$2, suffix2, suffix1$2, realLen)
  } else if ((len <= 1048576)) {
    var i1$3 = (31 & (((-1) + len) | 0));
    var i2$3 = (31 & (((((-1) + len) | 0) >>> 5) | 0));
    var i3$2 = (31 & (((((-1) + len) | 0) >>> 10) | 0));
    var i4 = (((((-1) + len) | 0) >>> 15) | 0);
    var data$3 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(this.a4$1, 1, i4), 4);
    var a$3 = this.a4$1.get(0);
    var prefix3 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$3, 1, a$3.u.length), 3);
    var a$4 = this.a4$1.get(0).get(0);
    var prefix2$2 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$4, 1, a$4.u.length), 2);
    var prefix1$3 = this.a4$1.get(0).get(0).get(0);
    var suffix3 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(this.a4$1.get(i4), i3$2), 3);
    var suffix2$2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(this.a4$1.get(i4).get(i3$2), i2$3), 2);
    var a$5 = this.a4$1.get(i4).get(i3$2).get(i2$3);
    var len$3 = ((1 + i1$3) | 0);
    var suffix1$3 = ((a$5.u.length === len$3) ? a$5 : $m_ju_Arrays$().copyOf__AO__I__AO(a$5, len$3));
    var len1$2 = prefix1$3.u.length;
    var len12$2 = ((len1$2 + (prefix2$2.u.length << 5)) | 0);
    var len123 = ((len12$2 + (prefix3.u.length << 10)) | 0);
    return new $c_sci_Vector4().init___AO__I__AAO__I__AAAO__I__AAAAO__AAAO__AAO__AO__I(prefix1$3, len1$2, prefix2$2, len12$2, prefix3, len123, data$3, suffix3, suffix2$2, suffix1$3, realLen)
  } else if ((len <= 33554432)) {
    var i1$4 = (31 & (((-1) + len) | 0));
    var i2$4 = (31 & (((((-1) + len) | 0) >>> 5) | 0));
    var i3$3 = (31 & (((((-1) + len) | 0) >>> 10) | 0));
    var i4$2 = (31 & (((((-1) + len) | 0) >>> 15) | 0));
    var i5 = (((((-1) + len) | 0) >>> 20) | 0);
    var data$4 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(this.a5$1, 1, i5), 5);
    var a$6 = this.a5$1.get(0);
    var prefix4 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$6, 1, a$6.u.length), 4);
    var a$7 = this.a5$1.get(0).get(0);
    var prefix3$2 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$7, 1, a$7.u.length), 3);
    var a$8 = this.a5$1.get(0).get(0).get(0);
    var prefix2$3 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$8, 1, a$8.u.length), 2);
    var prefix1$4 = this.a5$1.get(0).get(0).get(0).get(0);
    var suffix4 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(this.a5$1.get(i5), i4$2), 4);
    var suffix3$2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(this.a5$1.get(i5).get(i4$2), i3$3), 3);
    var suffix2$3 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(this.a5$1.get(i5).get(i4$2).get(i3$3), i2$4), 2);
    var a$9 = this.a5$1.get(i5).get(i4$2).get(i3$3).get(i2$4);
    var len$4 = ((1 + i1$4) | 0);
    var suffix1$4 = ((a$9.u.length === len$4) ? a$9 : $m_ju_Arrays$().copyOf__AO__I__AO(a$9, len$4));
    var len1$3 = prefix1$4.u.length;
    var len12$3 = ((len1$3 + (prefix2$3.u.length << 5)) | 0);
    var len123$2 = ((len12$3 + (prefix3$2.u.length << 10)) | 0);
    var len1234 = ((len123$2 + (prefix4.u.length << 15)) | 0);
    return new $c_sci_Vector5().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__AAAAO__AAAO__AAO__AO__I(prefix1$4, len1$3, prefix2$3, len12$3, prefix3$2, len123$2, prefix4, len1234, data$4, suffix4, suffix3$2, suffix2$3, suffix1$4, realLen)
  } else {
    var i1$5 = (31 & (((-1) + len) | 0));
    var i2$5 = (31 & (((((-1) + len) | 0) >>> 5) | 0));
    var i3$4 = (31 & (((((-1) + len) | 0) >>> 10) | 0));
    var i4$3 = (31 & (((((-1) + len) | 0) >>> 15) | 0));
    var i5$2 = (31 & (((((-1) + len) | 0) >>> 20) | 0));
    var i6 = (((((-1) + len) | 0) >>> 25) | 0);
    var data$5 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(this.a6$1, 1, i6), 6);
    var a$10 = this.a6$1.get(0);
    var prefix5 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$10, 1, a$10.u.length), 5);
    var a$11 = this.a6$1.get(0).get(0);
    var prefix4$2 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$11, 1, a$11.u.length), 4);
    var a$12 = this.a6$1.get(0).get(0).get(0);
    var prefix3$3 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$12, 1, a$12.u.length), 3);
    var a$13 = this.a6$1.get(0).get(0).get(0).get(0);
    var prefix2$4 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$13, 1, a$13.u.length), 2);
    var prefix1$5 = this.a6$1.get(0).get(0).get(0).get(0).get(0);
    var suffix5 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(this.a6$1.get(i6), i5$2), 5);
    var suffix4$2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(this.a6$1.get(i6).get(i5$2), i4$3), 4);
    var suffix3$3 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(this.a6$1.get(i6).get(i5$2).get(i4$3), i3$4), 3);
    var suffix2$4 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(this.a6$1.get(i6).get(i5$2).get(i4$3).get(i3$4), i2$5), 2);
    var a$14 = this.a6$1.get(i6).get(i5$2).get(i4$3).get(i3$4).get(i2$5);
    var len$5 = ((1 + i1$5) | 0);
    var suffix1$5 = ((a$14.u.length === len$5) ? a$14 : $m_ju_Arrays$().copyOf__AO__I__AO(a$14, len$5));
    var len1$4 = prefix1$5.u.length;
    var len12$4 = ((len1$4 + (prefix2$4.u.length << 5)) | 0);
    var len123$3 = ((len12$4 + (prefix3$3.u.length << 10)) | 0);
    var len1234$2 = ((len123$3 + (prefix4$2.u.length << 15)) | 0);
    var len12345 = ((len1234$2 + (prefix5.u.length << 20)) | 0);
    return new $c_sci_Vector6().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__I__AAAAAAO__AAAAAO__AAAAO__AAAO__AAO__AO__I(prefix1$5, len1$4, prefix2$4, len12$4, prefix3$3, len123$3, prefix4$2, len1234$2, prefix5, len12345, data$5, suffix5, suffix4$2, suffix3$3, suffix2$4, suffix1$5, realLen)
  }
});
$c_sci_VectorBuilder.prototype.addOne__O__scm_Growable = (function(elem) {
  return this.addOne__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sci_VectorBuilder.prototype.addVector__p1__sci_Vector__sci_VectorBuilder = (function(xs) {
  var sliceCount = xs.vectorSliceCount__I();
  var sliceIdx = 0;
  while ((sliceIdx < sliceCount)) {
    var slice = xs.vectorSlice__I__AO(sliceIdx);
    var idx = sliceIdx;
    var c = ((sliceCount / 2) | 0);
    var a = ((idx - c) | 0);
    var x1 = ((((1 + c) | 0) - ((a < 0) ? ((-a) | 0) : a)) | 0);
    switch (x1) {
      case 1: {
        this.addArr1__p1__AO__V(slice);
        break
      }
      default: {
        $m_sci_VectorStatics$().foreachRec__I__AO__F1__V((((-2) + x1) | 0), slice, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
          return (function(data$2) {
            var data = $asArrayOf_O(data$2, 1);
            $this.addArr1__p1__AO__V(data)
          })
        })(this)))
      }
    };
    sliceIdx = ((1 + sliceIdx) | 0)
  };
  return this
});
function $as_sci_VectorBuilder(obj) {
  return (((obj instanceof $c_sci_VectorBuilder) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.VectorBuilder"))
}
function $isArrayOf_sci_VectorBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorBuilder)))
}
function $asArrayOf_sci_VectorBuilder(obj, depth) {
  return (($isArrayOf_sci_VectorBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.VectorBuilder;", depth))
}
var $d_sci_VectorBuilder = new $TypeData().initClass({
  sci_VectorBuilder: 0
}, false, "scala.collection.immutable.VectorBuilder", {
  sci_VectorBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scm_Growable: 1,
  scm_Clearable: 1
});
$c_sci_VectorBuilder.prototype.$classData = $d_sci_VectorBuilder;
/** @constructor */
function $c_scm_ArrayBuffer$() {
  $c_O.call(this)
}
$c_scm_ArrayBuffer$.prototype = new $h_O();
$c_scm_ArrayBuffer$.prototype.constructor = $c_scm_ArrayBuffer$;
/** @constructor */
function $h_scm_ArrayBuffer$() {
  /*<skip>*/
}
$h_scm_ArrayBuffer$.prototype = $c_scm_ArrayBuffer$.prototype;
$c_scm_ArrayBuffer$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayBuffer$.prototype.growArray$1__p1__J__I__I__AO__AO = (function(arrayLength$1, n$1, end$1, array$2) {
  var lo = (arrayLength$1.lo$2 << 1);
  var hi = (((arrayLength$1.lo$2 >>> 31) | 0) | (arrayLength$1.hi$2 << 1));
  var t = (((hi === 0) ? (((-2147483648) ^ lo) > (-2147483632)) : (hi > 0)) ? new $c_sjsr_RuntimeLong().init___I__I(lo, hi) : new $c_sjsr_RuntimeLong().init___I__I(16, 0));
  var lo$1 = t.lo$2;
  var hi$1 = t.hi$2;
  var newSize_$_lo$2 = lo$1;
  var newSize_$_hi$2 = hi$1;
  while (true) {
    var hi$2 = (n$1 >> 31);
    var b_$_lo$2 = newSize_$_lo$2;
    var b_$_hi$2 = newSize_$_hi$2;
    var bhi = b_$_hi$2;
    if (((hi$2 === bhi) ? (((-2147483648) ^ n$1) > ((-2147483648) ^ b_$_lo$2)) : (hi$2 > bhi))) {
      var this$3_$_lo$2 = newSize_$_lo$2;
      var this$3_$_hi$2 = newSize_$_hi$2;
      var lo$2 = (this$3_$_lo$2 << 1);
      var hi$3 = (((this$3_$_lo$2 >>> 31) | 0) | (this$3_$_hi$2 << 1));
      var jsx$1_$_lo$2 = lo$2;
      var jsx$1_$_hi$2 = hi$3;
      newSize_$_lo$2 = jsx$1_$_lo$2;
      newSize_$_hi$2 = jsx$1_$_hi$2
    } else {
      break
    }
  };
  var this$4_$_lo$2 = newSize_$_lo$2;
  var this$4_$_hi$2 = newSize_$_hi$2;
  var ahi = this$4_$_hi$2;
  if (((ahi === 0) ? (((-2147483648) ^ this$4_$_lo$2) > (-1)) : (ahi > 0))) {
    if ((end$1 === 2147483647)) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new $c_jl_Exception().init___T("Collections can not have more than 2147483647 elements"))
    };
    var jsx$2_$_lo$2 = 2147483647;
    var jsx$2_$_hi$2 = 0;
    newSize_$_lo$2 = jsx$2_$_lo$2;
    newSize_$_hi$2 = jsx$2_$_hi$2
  };
  var this$5_$_lo$2 = newSize_$_lo$2;
  var this$5_$_hi$2 = newSize_$_hi$2;
  var newArray = $newArrayObject($d_O.getArrayOf(), [this$5_$_lo$2]);
  $m_s_Array$().copy__O__I__O__I__I__V(array$2, 0, newArray, 0, end$1);
  return newArray
});
$c_scm_ArrayBuffer$.prototype.scala$collection$mutable$ArrayBuffer$$ensureSize__AO__I__I__AO = (function(array, end, n) {
  var value = array.u.length;
  var hi = (value >> 31);
  var hi$1 = (n >> 31);
  if (((hi$1 === hi) ? (((-2147483648) ^ n) <= ((-2147483648) ^ value)) : (hi$1 < hi))) {
    return array
  } else {
    return this.growArray$1__p1__J__I__I__AO__AO(new $c_sjsr_RuntimeLong().init___I__I(value, hi), n, end, array)
  }
});
$c_scm_ArrayBuffer$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__scm_ArrayBuffer(source)
});
$c_scm_ArrayBuffer$.prototype.from__sc_IterableOnce__scm_ArrayBuffer = (function(coll) {
  var k = coll.knownSize__I();
  if ((k >= 0)) {
    var array = $newArrayObject($d_O.getArrayOf(), [((k > 16) ? k : 16)]);
    var it = coll.iterator__sc_Iterator();
    var isEmpty$4 = (k <= 0);
    var scala$collection$immutable$Range$$lastElement$f = (((-1) + k) | 0);
    if ((!isEmpty$4)) {
      var i = 0;
      while (true) {
        var v1 = i;
        array.set(v1, it.next__O());
        if ((i === scala$collection$immutable$Range$$lastElement$f)) {
          break
        };
        i = ((1 + i) | 0)
      }
    };
    return new $c_scm_ArrayBuffer().init___AO__I(array, k)
  } else {
    var this$8 = new $c_scm_ArrayBuffer().init___();
    return this$8.addAll__sc_IterableOnce__scm_ArrayBuffer(coll)
  }
});
$c_scm_ArrayBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer$$anon$1().init___()
});
$c_scm_ArrayBuffer$.prototype.apply__sci_Seq__O = (function(elems) {
  return this.from__sc_IterableOnce__scm_ArrayBuffer(elems)
});
var $d_scm_ArrayBuffer$ = new $TypeData().initClass({
  scm_ArrayBuffer$: 0
}, false, "scala.collection.mutable.ArrayBuffer$", {
  scm_ArrayBuffer$: 1,
  O: 1,
  sc_StrictOptimizedSeqFactory: 1,
  sc_SeqFactory: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer$.prototype.$classData = $d_scm_ArrayBuffer$;
var $n_scm_ArrayBuffer$ = (void 0);
function $m_scm_ArrayBuffer$() {
  if ((!$n_scm_ArrayBuffer$)) {
    $n_scm_ArrayBuffer$ = new $c_scm_ArrayBuffer$().init___()
  };
  return $n_scm_ArrayBuffer$
}
/** @constructor */
function $c_scm_ArrayBuffer$$anon$1() {
  $c_scm_GrowableBuilder.call(this)
}
$c_scm_ArrayBuffer$$anon$1.prototype = new $h_scm_GrowableBuilder();
$c_scm_ArrayBuffer$$anon$1.prototype.constructor = $c_scm_ArrayBuffer$$anon$1;
/** @constructor */
function $h_scm_ArrayBuffer$$anon$1() {
  /*<skip>*/
}
$h_scm_ArrayBuffer$$anon$1.prototype = $c_scm_ArrayBuffer$$anon$1.prototype;
$c_scm_ArrayBuffer$$anon$1.prototype.init___ = (function() {
  $c_scm_GrowableBuilder.prototype.init___scm_Growable.call(this, new $c_scm_ArrayBuffer().init___());
  return this
});
$c_scm_ArrayBuffer$$anon$1.prototype.sizeHint__I__V = (function(size) {
  $as_scm_ArrayBuffer(this.elems$1).ensureSize__I__V(size)
});
var $d_scm_ArrayBuffer$$anon$1 = new $TypeData().initClass({
  scm_ArrayBuffer$$anon$1: 0
}, false, "scala.collection.mutable.ArrayBuffer$$anon$1", {
  scm_ArrayBuffer$$anon$1: 1,
  scm_GrowableBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scm_Growable: 1,
  scm_Clearable: 1
});
$c_scm_ArrayBuffer$$anon$1.prototype.$classData = $d_scm_ArrayBuffer$$anon$1;
/** @constructor */
function $c_scm_IndexedSeq$() {
  $c_sc_SeqFactory$Delegate.call(this)
}
$c_scm_IndexedSeq$.prototype = new $h_sc_SeqFactory$Delegate();
$c_scm_IndexedSeq$.prototype.constructor = $c_scm_IndexedSeq$;
/** @constructor */
function $h_scm_IndexedSeq$() {
  /*<skip>*/
}
$h_scm_IndexedSeq$.prototype = $c_scm_IndexedSeq$.prototype;
$c_scm_IndexedSeq$.prototype.init___ = (function() {
  $c_sc_SeqFactory$Delegate.prototype.init___sc_SeqFactory.call(this, $m_scm_ArrayBuffer$());
  return this
});
var $d_scm_IndexedSeq$ = new $TypeData().initClass({
  scm_IndexedSeq$: 0
}, false, "scala.collection.mutable.IndexedSeq$", {
  scm_IndexedSeq$: 1,
  sc_SeqFactory$Delegate: 1,
  O: 1,
  sc_SeqFactory: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_scm_IndexedSeq$.prototype.$classData = $d_scm_IndexedSeq$;
var $n_scm_IndexedSeq$ = (void 0);
function $m_scm_IndexedSeq$() {
  if ((!$n_scm_IndexedSeq$)) {
    $n_scm_IndexedSeq$ = new $c_scm_IndexedSeq$().init___()
  };
  return $n_scm_IndexedSeq$
}
/** @constructor */
function $c_scm_ListBuffer$() {
  $c_O.call(this)
}
$c_scm_ListBuffer$.prototype = new $h_O();
$c_scm_ListBuffer$.prototype.constructor = $c_scm_ListBuffer$;
/** @constructor */
function $h_scm_ListBuffer$() {
  /*<skip>*/
}
$h_scm_ListBuffer$.prototype = $c_scm_ListBuffer$.prototype;
$c_scm_ListBuffer$.prototype.init___ = (function() {
  return this
});
$c_scm_ListBuffer$.prototype.from__sc_IterableOnce__O = (function(source) {
  var this$1 = new $c_scm_ListBuffer().init___();
  return this$1.addAll__sc_IterableOnce__scm_ListBuffer(source)
});
$c_scm_ListBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowableBuilder().init___scm_Growable(new $c_scm_ListBuffer().init___())
});
$c_scm_ListBuffer$.prototype.apply__sci_Seq__O = (function(elems) {
  var this$1 = new $c_scm_ListBuffer().init___();
  return this$1.addAll__sc_IterableOnce__scm_ListBuffer(elems)
});
var $d_scm_ListBuffer$ = new $TypeData().initClass({
  scm_ListBuffer$: 0
}, false, "scala.collection.mutable.ListBuffer$", {
  scm_ListBuffer$: 1,
  O: 1,
  sc_StrictOptimizedSeqFactory: 1,
  sc_SeqFactory: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer$.prototype.$classData = $d_scm_ListBuffer$;
var $n_scm_ListBuffer$ = (void 0);
function $m_scm_ListBuffer$() {
  if ((!$n_scm_ListBuffer$)) {
    $n_scm_ListBuffer$ = new $c_scm_ListBuffer$().init___()
  };
  return $n_scm_ListBuffer$
}
/** @constructor */
function $c_sjs_js_ArrayOps$ArrayIterator() {
  $c_sc_AbstractIterator.call(this);
  this.xs$2 = null;
  this.pos$2 = 0
}
$c_sjs_js_ArrayOps$ArrayIterator.prototype = new $h_sc_AbstractIterator();
$c_sjs_js_ArrayOps$ArrayIterator.prototype.constructor = $c_sjs_js_ArrayOps$ArrayIterator;
/** @constructor */
function $h_sjs_js_ArrayOps$ArrayIterator() {
  /*<skip>*/
}
$h_sjs_js_ArrayOps$ArrayIterator.prototype = $c_sjs_js_ArrayOps$ArrayIterator.prototype;
$c_sjs_js_ArrayOps$ArrayIterator.prototype.next__O = (function() {
  if ((this.pos$2 >= $uI(this.xs$2.length))) {
    throw new $c_ju_NoSuchElementException().init___()
  };
  var r = this.xs$2[this.pos$2];
  this.pos$2 = ((1 + this.pos$2) | 0);
  return r
});
$c_sjs_js_ArrayOps$ArrayIterator.prototype.hasNext__Z = (function() {
  return (this.pos$2 < $uI(this.xs$2.length))
});
$c_sjs_js_ArrayOps$ArrayIterator.prototype.drop__I__sc_Iterator = (function(n) {
  if ((n > 0)) {
    this.pos$2 = $uI($g.Math.min($uI(this.xs$2.length), ((this.pos$2 + n) | 0)))
  };
  return this
});
$c_sjs_js_ArrayOps$ArrayIterator.prototype.init___sjs_js_Array = (function(xs) {
  this.xs$2 = xs;
  this.pos$2 = 0;
  return this
});
var $d_sjs_js_ArrayOps$ArrayIterator = new $TypeData().initClass({
  sjs_js_ArrayOps$ArrayIterator: 0
}, false, "scala.scalajs.js.ArrayOps$ArrayIterator", {
  sjs_js_ArrayOps$ArrayIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1
});
$c_sjs_js_ArrayOps$ArrayIterator.prototype.$classData = $d_sjs_js_ArrayOps$ArrayIterator;
/** @constructor */
function $c_sjs_js_WrappedArray$() {
  $c_O.call(this)
}
$c_sjs_js_WrappedArray$.prototype = new $h_O();
$c_sjs_js_WrappedArray$.prototype.constructor = $c_sjs_js_WrappedArray$;
/** @constructor */
function $h_sjs_js_WrappedArray$() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray$.prototype = $c_sjs_js_WrappedArray$.prototype;
$c_sjs_js_WrappedArray$.prototype.init___ = (function() {
  return this
});
$c_sjs_js_WrappedArray$.prototype.from__sc_IterableOnce__sjs_js_WrappedArray = (function(source) {
  var this$1 = new $c_sjs_js_WrappedArray().init___();
  return $as_sjs_js_WrappedArray($as_scm_Builder($f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this$1, source)).result__O())
});
$c_sjs_js_WrappedArray$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sjs_js_WrappedArray(source)
});
$c_sjs_js_WrappedArray$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sjs_js_WrappedArray().init___()
});
$c_sjs_js_WrappedArray$.prototype.apply__sci_Seq__O = (function(elems) {
  return this.from__sc_IterableOnce__sjs_js_WrappedArray(elems)
});
var $d_sjs_js_WrappedArray$ = new $TypeData().initClass({
  sjs_js_WrappedArray$: 0
}, false, "scala.scalajs.js.WrappedArray$", {
  sjs_js_WrappedArray$: 1,
  O: 1,
  sc_StrictOptimizedSeqFactory: 1,
  sc_SeqFactory: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sjs_js_WrappedArray$.prototype.$classData = $d_sjs_js_WrappedArray$;
var $n_sjs_js_WrappedArray$ = (void 0);
function $m_sjs_js_WrappedArray$() {
  if ((!$n_sjs_js_WrappedArray$)) {
    $n_sjs_js_WrappedArray$ = new $c_sjs_js_WrappedArray$().init___()
  };
  return $n_sjs_js_WrappedArray$
}
/** @constructor */
function $c_sjsr_UndefinedBehaviorError() {
  $c_jl_VirtualMachineError.call(this)
}
$c_sjsr_UndefinedBehaviorError.prototype = new $h_jl_VirtualMachineError();
$c_sjsr_UndefinedBehaviorError.prototype.constructor = $c_sjsr_UndefinedBehaviorError;
/** @constructor */
function $h_sjsr_UndefinedBehaviorError() {
  /*<skip>*/
}
$h_sjsr_UndefinedBehaviorError.prototype = $c_sjsr_UndefinedBehaviorError.prototype;
$c_sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  var message = ((cause === null) ? null : cause.toString__T());
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, message, cause, true, true);
  return this
});
var $d_sjsr_UndefinedBehaviorError = new $TypeData().initClass({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", {
  sjsr_UndefinedBehaviorError: 1,
  jl_VirtualMachineError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_UndefinedBehaviorError.prototype.$classData = $d_sjsr_UndefinedBehaviorError;
/** @constructor */
function $c_sjsr_WrappedVarArgs$() {
  $c_O.call(this)
}
$c_sjsr_WrappedVarArgs$.prototype = new $h_O();
$c_sjsr_WrappedVarArgs$.prototype.constructor = $c_sjsr_WrappedVarArgs$;
/** @constructor */
function $h_sjsr_WrappedVarArgs$() {
  /*<skip>*/
}
$h_sjsr_WrappedVarArgs$.prototype = $c_sjsr_WrappedVarArgs$.prototype;
$c_sjsr_WrappedVarArgs$.prototype.init___ = (function() {
  return this
});
$c_sjsr_WrappedVarArgs$.prototype.from__sc_IterableOnce__sjsr_WrappedVarArgs = (function(source) {
  var this$1 = this.newBuilder__scm_Builder();
  return $as_sjsr_WrappedVarArgs($as_scm_Builder(this$1.addAll__sc_IterableOnce__scm_Growable(source)).result__O())
});
$c_sjsr_WrappedVarArgs$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sjsr_WrappedVarArgs(source)
});
$c_sjsr_WrappedVarArgs$.prototype.newBuilder__scm_Builder = (function() {
  var array = [];
  var this$3 = new $c_sjs_js_WrappedArray().init___sjs_js_Array(array);
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$1$2) {
      var x$1 = $as_sjs_js_WrappedArray(x$1$2);
      return new $c_sjsr_WrappedVarArgs().init___sjs_js_Array(x$1.array$5)
    })
  })(this));
  return new $c_scm_Builder$$anon$1().init___scm_Builder__F1(this$3, f)
});
$c_sjsr_WrappedVarArgs$.prototype.apply__sci_Seq__O = (function(elems) {
  return this.from__sc_IterableOnce__sjsr_WrappedVarArgs(elems)
});
var $d_sjsr_WrappedVarArgs$ = new $TypeData().initClass({
  sjsr_WrappedVarArgs$: 0
}, false, "scala.scalajs.runtime.WrappedVarArgs$", {
  sjsr_WrappedVarArgs$: 1,
  O: 1,
  sc_StrictOptimizedSeqFactory: 1,
  sc_SeqFactory: 1,
  sc_IterableFactory: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_WrappedVarArgs$.prototype.$classData = $d_sjsr_WrappedVarArgs$;
var $n_sjsr_WrappedVarArgs$ = (void 0);
function $m_sjsr_WrappedVarArgs$() {
  if ((!$n_sjsr_WrappedVarArgs$)) {
    $n_sjsr_WrappedVarArgs$ = new $c_sjsr_WrappedVarArgs$().init___()
  };
  return $n_sjsr_WrappedVarArgs$
}
/** @constructor */
function $c_sr_ScalaRunTime$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.c$2 = 0;
  this.cmax$2 = 0;
  this.x$2$2 = null
}
$c_sr_ScalaRunTime$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sr_ScalaRunTime$$anon$1.prototype.constructor = $c_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $h_sr_ScalaRunTime$$anon$1() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$$anon$1.prototype = $c_sr_ScalaRunTime$$anon$1.prototype;
$c_sr_ScalaRunTime$$anon$1.prototype.next__O = (function() {
  var result = this.x$2$2.productElement__I__O(this.c$2);
  this.c$2 = ((1 + this.c$2) | 0);
  return result
});
$c_sr_ScalaRunTime$$anon$1.prototype.init___s_Product = (function(x$2) {
  this.x$2$2 = x$2;
  this.c$2 = 0;
  this.cmax$2 = x$2.productArity__I();
  return this
});
$c_sr_ScalaRunTime$$anon$1.prototype.hasNext__Z = (function() {
  return (this.c$2 < this.cmax$2)
});
var $d_sr_ScalaRunTime$$anon$1 = new $TypeData().initClass({
  sr_ScalaRunTime$$anon$1: 0
}, false, "scala.runtime.ScalaRunTime$$anon$1", {
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1
});
$c_sr_ScalaRunTime$$anon$1.prototype.$classData = $d_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Js$$anon$1() {
  $c_O.call(this);
  this.raw$1 = null;
  this.mountRaw$1 = null
}
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Js$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Js$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype = $c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.mountRaw__F1 = (function() {
  return this.mountRaw$1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.raw__Ljapgolly_scalajs_react_raw_React$ComponentElement = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.mapMounted__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function(f) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  var mp = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$2().init___Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot__F1__F1(this, mp, f)
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.mapUnmountedProps__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function(f) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  var mm = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$2().init___Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot__F1__F1(this, f, mm)
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.init___Ljapgolly_scalajs_react_raw_React$ComponentElement__F1 = (function(r$1, m$1) {
  this.raw$1 = r$1;
  this.mountRaw$1 = m$1;
  return this
});
var $d_Ljapgolly_scalajs_react_component_Js$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Js$$anon$1: 0
}, false, "japgolly.scalajs.react.component.Js$$anon$1", {
  Ljapgolly_scalajs_react_component_Js$$anon$1: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Js$UnmountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedRaw: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot: 1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Js$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Js$$anon$2() {
  $c_O.call(this);
  this.raw$1 = null;
  this.mountRaw$1 = null;
  this.from$1$1 = null;
  this.mp$1$1 = null;
  this.mm$1$1 = null
}
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Js$$anon$2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Js$$anon$2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype = $c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype.mountRaw__F1 = (function() {
  return this.mountRaw$1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype.raw__Ljapgolly_scalajs_react_raw_React$ComponentElement = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype.mapMounted__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function(f) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  var from = this.from$1$1;
  var mp = this.mp$1$1;
  var mm = f.compose__F1__F1(this.mm$1$1);
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$2().init___Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot__F1__F1(from, mp, mm)
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype.init___Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot__F1__F1 = (function(from$1, mp$1, mm$1) {
  this.from$1$1 = from$1;
  this.mp$1$1 = mp$1;
  this.mm$1$1 = mm$1;
  this.raw$1 = from$1.raw__Ljapgolly_scalajs_react_raw_React$ComponentElement();
  this.mountRaw$1 = mm$1.compose__F1__F1(from$1.mountRaw__F1());
  return this
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype.mapUnmountedProps__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function(f) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  var from = this.from$1$1;
  var mp = f.compose__F1__F1(this.mp$1$1);
  var mm = this.mm$1$1;
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$2().init___Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot__F1__F1(from, mp, mm)
});
var $d_Ljapgolly_scalajs_react_component_Js$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Js$$anon$2: 0
}, false, "japgolly.scalajs.react.component.Js$$anon$2", {
  Ljapgolly_scalajs_react_component_Js$$anon$2: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Js$UnmountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedRaw: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot: 1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Js$$anon$2;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1() {
  $c_O.call(this);
  this.raw$1 = null;
  this.ctor$1 = null;
  this.$$outer$1 = null;
  this.rc$1$1 = null;
  this.c$1$1 = null;
  this.pf$1$1 = null
}
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype = $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__sjs_js_Any__Ljapgolly_scalajs_react_CtorType__Ljapgolly_scalajs_react_internal_Profunctor = (function($$outer, rc$1, c$1, pf$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.rc$1$1 = rc$1;
  this.c$1$1 = c$1;
  this.pf$1$1 = pf$1;
  this.raw$1 = rc$1;
  this.ctor$1 = c$1;
  return this
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.ctor__Ljapgolly_scalajs_react_CtorType = (function() {
  return this.ctor$1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.raw__sjs_js_Any = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.cmapCtorProps__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(f) {
  var this$1 = this.$$outer$1;
  var mc = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  var mu = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  var pf = this.pf$1$1;
  return new $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2().init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot__F1__F1__F1__Ljapgolly_scalajs_react_internal_Profunctor(this$1, this, mc, f, mu, pf)
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.mapUnmounted__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(f) {
  var this$1 = this.$$outer$1;
  var cp = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  var mc = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  var pf = this.pf$1$1;
  return new $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2().init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot__F1__F1__F1__Ljapgolly_scalajs_react_internal_Profunctor(this$1, this, mc, cp, f, pf)
});
var $d_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1: 0
}, false, "japgolly.scalajs.react.component.JsBaseComponentTemplate$$anon$1", {
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentRaw: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentWithRoot: 1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2() {
  $c_O.call(this);
  this.raw$1 = null;
  this.ctor$1 = null;
  this.$$outer$1 = null;
  this.from$1$1 = null;
  this.mc$1$1 = null;
  this.cp$1$1 = null;
  this.mu$1$1 = null;
  this.pf$2$1 = null
}
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype = $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.ctor__Ljapgolly_scalajs_react_CtorType = (function() {
  return this.ctor$1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.raw__sjs_js_Any = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.cmapCtorProps__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(f) {
  var this$1 = this.$$outer$1;
  var from = this.from$1$1;
  var cp = this.cp$1$1.compose__F1__F1(f);
  var mc = this.mc$1$1;
  var mu = this.mu$1$1;
  var pf = this.pf$2$1;
  return new $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2().init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot__F1__F1__F1__Ljapgolly_scalajs_react_internal_Profunctor(this$1, from, mc, cp, mu, pf)
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot__F1__F1__F1__Ljapgolly_scalajs_react_internal_Profunctor = (function($$outer, from$1, mc$1, cp$1, mu$1, pf$2) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.from$1$1 = from$1;
  this.mc$1$1 = mc$1;
  this.cp$1$1 = cp$1;
  this.mu$1$1 = mu$1;
  this.pf$2$1 = pf$2;
  this.raw$1 = from$1.raw__sjs_js_Any();
  $m_Ljapgolly_scalajs_react_internal_package$();
  var f = mc$1.apply__O__O(from$1.ctor__Ljapgolly_scalajs_react_CtorType());
  var p = this.pf$2$1;
  this.ctor$1 = $as_Ljapgolly_scalajs_react_CtorType(new $c_Ljapgolly_scalajs_react_internal_Profunctor$Ops().init___O__Ljapgolly_scalajs_react_internal_Profunctor(f, p).dimap__F1__F1__O(cp$1, mu$1));
  return this
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.mapUnmounted__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(f) {
  var this$1 = this.$$outer$1;
  var from = this.from$1$1;
  var cp = this.cp$1$1;
  var mc = this.mc$1$1;
  var mu = f.compose__F1__F1(this.mu$1$1);
  var pf = this.pf$2$1;
  return new $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2().init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot__F1__F1__F1__Ljapgolly_scalajs_react_internal_Profunctor(this$1, from, mc, cp, mu, pf)
});
var $d_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2: 0
}, false, "japgolly.scalajs.react.component.JsBaseComponentTemplate$$anon$2", {
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentRaw: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentWithRoot: 1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2;
/** @constructor */
function $c_jl_ArrayIndexOutOfBoundsException() {
  $c_jl_IndexOutOfBoundsException.call(this)
}
$c_jl_ArrayIndexOutOfBoundsException.prototype = new $h_jl_IndexOutOfBoundsException();
$c_jl_ArrayIndexOutOfBoundsException.prototype.constructor = $c_jl_ArrayIndexOutOfBoundsException;
/** @constructor */
function $h_jl_ArrayIndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_ArrayIndexOutOfBoundsException.prototype = $c_jl_ArrayIndexOutOfBoundsException.prototype;
$c_jl_ArrayIndexOutOfBoundsException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
$c_jl_ArrayIndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_ArrayIndexOutOfBoundsException = new $TypeData().initClass({
  jl_ArrayIndexOutOfBoundsException: 0
}, false, "java.lang.ArrayIndexOutOfBoundsException", {
  jl_ArrayIndexOutOfBoundsException: 1,
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArrayIndexOutOfBoundsException.prototype.$classData = $d_jl_ArrayIndexOutOfBoundsException;
/** @constructor */
function $c_jl_NumberFormatException() {
  $c_jl_IllegalArgumentException.call(this)
}
$c_jl_NumberFormatException.prototype = new $h_jl_IllegalArgumentException();
$c_jl_NumberFormatException.prototype.constructor = $c_jl_NumberFormatException;
/** @constructor */
function $h_jl_NumberFormatException() {
  /*<skip>*/
}
$h_jl_NumberFormatException.prototype = $c_jl_NumberFormatException.prototype;
$c_jl_NumberFormatException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_NumberFormatException = new $TypeData().initClass({
  jl_NumberFormatException: 0
}, false, "java.lang.NumberFormatException", {
  jl_NumberFormatException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NumberFormatException.prototype.$classData = $d_jl_NumberFormatException;
/** @constructor */
function $c_jl_StringIndexOutOfBoundsException() {
  $c_jl_IndexOutOfBoundsException.call(this)
}
$c_jl_StringIndexOutOfBoundsException.prototype = new $h_jl_IndexOutOfBoundsException();
$c_jl_StringIndexOutOfBoundsException.prototype.constructor = $c_jl_StringIndexOutOfBoundsException;
/** @constructor */
function $h_jl_StringIndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_StringIndexOutOfBoundsException.prototype = $c_jl_StringIndexOutOfBoundsException.prototype;
$c_jl_StringIndexOutOfBoundsException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
$c_jl_StringIndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, s, null, true, true);
  return this
});
var $d_jl_StringIndexOutOfBoundsException = new $TypeData().initClass({
  jl_StringIndexOutOfBoundsException: 0
}, false, "java.lang.StringIndexOutOfBoundsException", {
  jl_StringIndexOutOfBoundsException: 1,
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StringIndexOutOfBoundsException.prototype.$classData = $d_jl_StringIndexOutOfBoundsException;
/** @constructor */
function $c_ju_HashMap$EntrySet() {
  $c_ju_AbstractSet.call(this);
  this.$$outer$3 = null
}
$c_ju_HashMap$EntrySet.prototype = new $h_ju_AbstractSet();
$c_ju_HashMap$EntrySet.prototype.constructor = $c_ju_HashMap$EntrySet;
/** @constructor */
function $h_ju_HashMap$EntrySet() {
  /*<skip>*/
}
$h_ju_HashMap$EntrySet.prototype = $c_ju_HashMap$EntrySet.prototype;
$c_ju_HashMap$EntrySet.prototype.size__I = (function() {
  return this.$$outer$3.contentSize$2
});
$c_ju_HashMap$EntrySet.prototype.contains__O__Z = (function(o) {
  if ($is_ju_Map$Entry(o)) {
    var x2 = $as_ju_Map$Entry(o);
    var this$1 = this.$$outer$3;
    var key = x2.key$1;
    if ((key === null)) {
      var hash = 0
    } else {
      var originalHash = $objectHashCode(key);
      var hash = (originalHash ^ ((originalHash >>> 16) | 0))
    };
    var node = this$1.java$util$HashMap$$findNode0__O__I__I__ju_HashMap$Node(key, hash, (hash & (((-1) + this$1.java$util$HashMap$$table$f.u.length) | 0)));
    if ((node !== null)) {
      var a = node.value$1;
      var b = x2.value$1;
      return ((a === null) ? (b === null) : $objectEquals(a, b))
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_ju_HashMap$EntrySet.prototype.init___ju_HashMap = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$3 = $$outer
  };
  return this
});
$c_ju_HashMap$EntrySet.prototype.iterator__ju_Iterator = (function() {
  var this$1 = this.$$outer$3;
  return new $c_ju_HashMap$NodeIterator().init___ju_HashMap(this$1)
});
var $d_ju_HashMap$EntrySet = new $TypeData().initClass({
  ju_HashMap$EntrySet: 0
}, false, "java.util.HashMap$EntrySet", {
  ju_HashMap$EntrySet: 1,
  ju_AbstractSet: 1,
  ju_AbstractCollection: 1,
  O: 1,
  ju_Collection: 1,
  jl_Iterable: 1,
  ju_Set: 1
});
$c_ju_HashMap$EntrySet.prototype.$classData = $d_ju_HashMap$EntrySet;
/** @constructor */
function $c_ju_Properties() {
  $c_ju_Hashtable.call(this);
  this.defaults$3 = null
}
$c_ju_Properties.prototype = new $h_ju_Hashtable();
$c_ju_Properties.prototype.constructor = $c_ju_Properties;
/** @constructor */
function $h_ju_Properties() {
  /*<skip>*/
}
$h_ju_Properties.prototype = $c_ju_Properties.prototype;
$c_ju_Properties.prototype.init___ = (function() {
  $c_ju_Properties.prototype.init___ju_Properties.call(this, null);
  return this
});
$c_ju_Properties.prototype.init___ju_Properties = (function(defaults) {
  this.defaults$3 = defaults;
  $c_ju_Hashtable.prototype.init___ju_HashMap.call(this, new $c_ju_HashMap().init___());
  return this
});
$c_ju_Properties.prototype.getProperty__T__T__T = (function(key, defaultValue) {
  var x1 = this.get__O__O(key);
  if ($is_T(x1)) {
    var x2 = $as_T(x1);
    return x2
  } else {
    return ((this.defaults$3 !== null) ? this.defaults$3.getProperty__T__T__T(key, defaultValue) : defaultValue)
  }
});
var $d_ju_Properties = new $TypeData().initClass({
  ju_Properties: 0
}, false, "java.util.Properties", {
  ju_Properties: 1,
  ju_Hashtable: 1,
  ju_Dictionary: 1,
  O: 1,
  ju_Map: 1,
  jl_Cloneable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_Properties.prototype.$classData = $d_ju_Properties;
/** @constructor */
function $c_s_None$() {
  $c_s_Option.call(this)
}
$c_s_None$.prototype = new $h_s_Option();
$c_s_None$.prototype.constructor = $c_s_None$;
/** @constructor */
function $h_s_None$() {
  /*<skip>*/
}
$h_s_None$.prototype = $c_s_None$.prototype;
$c_s_None$.prototype.init___ = (function() {
  return this
});
$c_s_None$.prototype.productPrefix__T = (function() {
  return "None"
});
$c_s_None$.prototype.productArity__I = (function() {
  return 0
});
$c_s_None$.prototype.get__O = (function() {
  this.get__sr_Nothing$()
});
$c_s_None$.prototype.productElement__I__O = (function(x$1) {
  return $m_sr_Statics$().ioobe__I__O(x$1)
});
$c_s_None$.prototype.toString__T = (function() {
  return "None"
});
$c_s_None$.prototype.get__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("None.get")
});
$c_s_None$.prototype.hashCode__I = (function() {
  return 2433880
});
$c_s_None$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_s_None$ = new $TypeData().initClass({
  s_None$: 0
}, false, "scala.None$", {
  s_None$: 1,
  s_Option: 1,
  O: 1,
  sc_IterableOnce: 1,
  s_Product: 1,
  s_Equals: 1,
  Ljava_io_Serializable: 1
});
$c_s_None$.prototype.$classData = $d_s_None$;
var $n_s_None$ = (void 0);
function $m_s_None$() {
  if ((!$n_s_None$)) {
    $n_s_None$ = new $c_s_None$().init___()
  };
  return $n_s_None$
}
/** @constructor */
function $c_s_Some() {
  $c_s_Option.call(this);
  this.value$2 = null
}
$c_s_Some.prototype = new $h_s_Option();
$c_s_Some.prototype.constructor = $c_s_Some;
/** @constructor */
function $h_s_Some() {
  /*<skip>*/
}
$h_s_Some.prototype = $c_s_Some.prototype;
$c_s_Some.prototype.productPrefix__T = (function() {
  return "Some"
});
$c_s_Some.prototype.productArity__I = (function() {
  return 1
});
$c_s_Some.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ((x$1 instanceof $c_s_Some)) {
    var Some$1 = $as_s_Some(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.value$2, Some$1.value$2)
  } else {
    return false
  }
});
$c_s_Some.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      return $m_sr_Statics$().ioobe__I__O(x$1)
    }
  }
});
$c_s_Some.prototype.get__O = (function() {
  return this.value$2
});
$c_s_Some.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_Some.prototype.init___O = (function(value) {
  this.value$2 = value;
  return this
});
$c_s_Some.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__Z__I(this, (-889275714), false)
});
$c_s_Some.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $as_s_Some(obj) {
  return (((obj instanceof $c_s_Some) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Some"))
}
function $isArrayOf_s_Some(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Some)))
}
function $asArrayOf_s_Some(obj, depth) {
  return (($isArrayOf_s_Some(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Some;", depth))
}
var $d_s_Some = new $TypeData().initClass({
  s_Some: 0
}, false, "scala.Some", {
  s_Some: 1,
  s_Option: 1,
  O: 1,
  sc_IterableOnce: 1,
  s_Product: 1,
  s_Equals: 1,
  Ljava_io_Serializable: 1
});
$c_s_Some.prototype.$classData = $d_s_Some;
/** @constructor */
function $c_s_reflect_ClassTag$GenericClassTag() {
  $c_O.call(this);
  this.runtimeClass$1 = null
}
$c_s_reflect_ClassTag$GenericClassTag.prototype = new $h_O();
$c_s_reflect_ClassTag$GenericClassTag.prototype.constructor = $c_s_reflect_ClassTag$GenericClassTag;
/** @constructor */
function $h_s_reflect_ClassTag$GenericClassTag() {
  /*<skip>*/
}
$h_s_reflect_ClassTag$GenericClassTag.prototype = $c_s_reflect_ClassTag$GenericClassTag.prototype;
$c_s_reflect_ClassTag$GenericClassTag.prototype.newArray__I__O = (function(len) {
  return $m_jl_reflect_Array$().newInstance__jl_Class__I__O(this.runtimeClass$1, len)
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.equals__O__Z = (function(x) {
  return $f_s_reflect_ClassTag__equals__O__Z(this, x)
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.toString__T = (function() {
  var clazz = this.runtimeClass$1;
  return $f_s_reflect_ClassTag__prettyprint$1__ps_reflect_ClassTag__jl_Class__T(this, clazz)
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.runtimeClass__jl_Class = (function() {
  return this.runtimeClass$1
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.init___jl_Class = (function(runtimeClass) {
  this.runtimeClass$1 = runtimeClass;
  return this
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.hashCode__I = (function() {
  return $m_sr_Statics$().anyHash__O__I(this.runtimeClass$1)
});
var $d_s_reflect_ClassTag$GenericClassTag = new $TypeData().initClass({
  s_reflect_ClassTag$GenericClassTag: 0
}, false, "scala.reflect.ClassTag$GenericClassTag", {
  s_reflect_ClassTag$GenericClassTag: 1,
  O: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.$classData = $d_s_reflect_ClassTag$GenericClassTag;
/** @constructor */
function $c_sc_AbstractIterable() {
  $c_O.call(this)
}
$c_sc_AbstractIterable.prototype = new $h_O();
$c_sc_AbstractIterable.prototype.constructor = $c_sc_AbstractIterable;
/** @constructor */
function $h_sc_AbstractIterable() {
  /*<skip>*/
}
$h_sc_AbstractIterable.prototype = $c_sc_AbstractIterable.prototype;
$c_sc_AbstractIterable.prototype.head__O = (function() {
  return this.iterator__sc_Iterator().next__O()
});
$c_sc_AbstractIterable.prototype.isEmpty__Z = (function() {
  return $f_sc_IterableOnceOps__isEmpty__Z(this)
});
$c_sc_AbstractIterable.prototype.fromSpecific__sc_IterableOnce__O = (function(coll) {
  return this.fromSpecific__sc_IterableOnce__sc_IterableOps(coll)
});
$c_sc_AbstractIterable.prototype.foreach__F1__V = (function(f) {
  $f_sc_IterableOnceOps__foreach__F1__V(this, f)
});
$c_sc_AbstractIterable.prototype.copyToArray__O__I__I = (function(xs, start) {
  return $f_sc_IterableOnceOps__copyToArray__O__I__I(this, xs, start)
});
$c_sc_AbstractIterable.prototype.drop__I__O = (function(n) {
  return $f_sc_IterableOps__drop__I__O(this, n)
});
$c_sc_AbstractIterable.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractIterable.prototype.tail__O = (function() {
  return $f_sc_IterableOps__tail__O(this)
});
$c_sc_AbstractIterable.prototype.className__T = (function() {
  return this.stringPrefix__T()
});
$c_sc_AbstractIterable.prototype.knownSize__I = (function() {
  return (-1)
});
$c_sc_AbstractIterable.prototype.fromSpecific__sc_IterableOnce__sc_IterableOps = (function(coll) {
  return $as_sc_IterableOps(this.iterableFactory__sc_IterableFactory().from__sc_IterableOnce__O(coll))
});
/** @constructor */
function $c_sc_IndexedSeqView$IndexedSeqViewIterator() {
  $c_sc_AbstractIterator.call(this);
  this.self$2 = null;
  this.current$2 = 0;
  this.remainder$2 = 0
}
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype = new $h_sc_AbstractIterator();
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.constructor = $c_sc_IndexedSeqView$IndexedSeqViewIterator;
/** @constructor */
function $h_sc_IndexedSeqView$IndexedSeqViewIterator() {
  /*<skip>*/
}
$h_sc_IndexedSeqView$IndexedSeqViewIterator.prototype = $c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype;
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    var r = this.self$2.apply__I__O(this.current$2);
    this.current$2 = ((1 + this.current$2) | 0);
    this.remainder$2 = (((-1) + this.remainder$2) | 0);
    return r
  } else {
    return $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f.next__O()
  }
});
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.init___sc_IndexedSeqView = (function(self) {
  this.self$2 = self;
  this.current$2 = 0;
  this.remainder$2 = self.length__I();
  return this
});
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.hasNext__Z = (function() {
  return (this.remainder$2 > 0)
});
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.drop__I__sc_Iterator = (function(n) {
  if ((n > 0)) {
    this.current$2 = ((this.current$2 + n) | 0);
    var b = ((this.remainder$2 - n) | 0);
    this.remainder$2 = ((b < 0) ? 0 : b)
  };
  return this
});
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.knownSize__I = (function() {
  return this.remainder$2
});
var $d_sc_IndexedSeqView$IndexedSeqViewIterator = new $TypeData().initClass({
  sc_IndexedSeqView$IndexedSeqViewIterator: 0
}, false, "scala.collection.IndexedSeqView$IndexedSeqViewIterator", {
  sc_IndexedSeqView$IndexedSeqViewIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  Ljava_io_Serializable: 1
});
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.$classData = $d_sc_IndexedSeqView$IndexedSeqViewIterator;
function $f_sc_View__toString__T($thiz) {
  return ($thiz.className__T() + "(<not computed>)")
}
function $is_sc_View(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_View)))
}
function $as_sc_View(obj) {
  return (($is_sc_View(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.View"))
}
function $isArrayOf_sc_View(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_View)))
}
function $asArrayOf_sc_View(obj, depth) {
  return (($isArrayOf_sc_View(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.View;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_PackageBase() {
  $c_Ljapgolly_scalajs_react_vdom_Exports.call(this);
  this.vdomAttrVtBoolean$2 = null;
  this.vdomAttrVtString$2 = null;
  this.vdomAttrVtInt$2 = null;
  this.vdomAttrVtLong$2 = null;
  this.vdomAttrVtFloat$2 = null;
  this.vdomAttrVtDouble$2 = null;
  this.vdomAttrVtShort$2 = null;
  this.vdomAttrVtByte$2 = null;
  this.vdomAttrVtJsObject$2 = null;
  this.vdomAttrVtInnerHtml$2 = null;
  this.vdomAttrVtKeyL$2 = null;
  this.vdomAttrVtKeyS$2 = null;
  this.bitmap$0$2 = 0
}
$c_Ljapgolly_scalajs_react_vdom_PackageBase.prototype = new $h_Ljapgolly_scalajs_react_vdom_Exports();
$c_Ljapgolly_scalajs_react_vdom_PackageBase.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_PackageBase;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_PackageBase() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_PackageBase.prototype = $c_Ljapgolly_scalajs_react_vdom_PackageBase.prototype;
$c_Ljapgolly_scalajs_react_vdom_PackageBase.prototype.init___ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Exports.prototype.init___.call(this);
  $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1__$$init$__V(this);
  $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr__$$init$__V(this);
  return this
});
/** @constructor */
function $c_Ljava_io_PrintStream() {
  $c_Ljava_io_FilterOutputStream.call(this);
  this.encoder$3 = null;
  this.autoFlush$3 = false;
  this.charset$3 = null;
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  this.bitmap$0$3 = false
}
$c_Ljava_io_PrintStream.prototype = new $h_Ljava_io_FilterOutputStream();
$c_Ljava_io_PrintStream.prototype.constructor = $c_Ljava_io_PrintStream;
/** @constructor */
function $h_Ljava_io_PrintStream() {
  /*<skip>*/
}
$h_Ljava_io_PrintStream.prototype = $c_Ljava_io_PrintStream.prototype;
$c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset = (function(_out, autoFlush, charset) {
  this.autoFlush$3 = autoFlush;
  this.charset$3 = charset;
  $c_Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream.call(this, _out);
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  return this
});
/** @constructor */
function $c_s_reflect_AnyValManifest() {
  $c_O.call(this);
  this.toString$1 = null;
  this.hashCode$1 = 0
}
$c_s_reflect_AnyValManifest.prototype = new $h_O();
$c_s_reflect_AnyValManifest.prototype.constructor = $c_s_reflect_AnyValManifest;
/** @constructor */
function $h_s_reflect_AnyValManifest() {
  /*<skip>*/
}
$h_s_reflect_AnyValManifest.prototype = $c_s_reflect_AnyValManifest.prototype;
$c_s_reflect_AnyValManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_AnyValManifest.prototype.toString__T = (function() {
  return this.toString$1
});
$c_s_reflect_AnyValManifest.prototype.hashCode__I = (function() {
  return this.hashCode$1
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ClassTypeManifest() {
  $c_O.call(this);
  this.prefix$1 = null;
  this.runtimeClass1$1 = null;
  this.typeArguments$1 = null
}
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype = new $h_O();
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype.constructor = $c_s_reflect_ManifestFactory$ClassTypeManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$ClassTypeManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ClassTypeManifest.prototype = $c_s_reflect_ManifestFactory$ClassTypeManifest.prototype;
function $f_sc_StrictOptimizedLinearSeqOps__loop$2__psc_StrictOptimizedLinearSeqOps__I__sc_LinearSeq__sc_LinearSeq($thiz, n, s) {
  _loop: while (true) {
    if (((n <= 0) || s.isEmpty__Z())) {
      return s
    } else {
      var temp$n = (((-1) + n) | 0);
      var temp$s = $as_sc_LinearSeq(s.tail__O());
      n = temp$n;
      s = temp$s;
      continue _loop
    }
  }
}
/** @constructor */
function $c_sjs_js_JavaScriptException() {
  $c_jl_RuntimeException.call(this);
  this.exception$4 = null
}
$c_sjs_js_JavaScriptException.prototype = new $h_jl_RuntimeException();
$c_sjs_js_JavaScriptException.prototype.constructor = $c_sjs_js_JavaScriptException;
/** @constructor */
function $h_sjs_js_JavaScriptException() {
  /*<skip>*/
}
$h_sjs_js_JavaScriptException.prototype = $c_sjs_js_JavaScriptException.prototype;
$c_sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
$c_sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
$c_sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  var e = this.exception$4;
  this.stackdata = e;
  return this
});
$c_sjs_js_JavaScriptException.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ((x$1 instanceof $c_sjs_js_JavaScriptException)) {
    var JavaScriptException$1 = $as_sjs_js_JavaScriptException(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.exception$4, JavaScriptException$1.exception$4)
  } else {
    return false
  }
});
$c_sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.exception$4;
      break
    }
    default: {
      return $m_sr_Statics$().ioobe__I__O(x$1)
    }
  }
});
$c_sjs_js_JavaScriptException.prototype.getMessage__T = (function() {
  return $objectToString(this.exception$4)
});
$c_sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  $c_jl_Throwable.prototype.init___T__jl_Throwable__Z__Z.call(this, null, null, true, true);
  return this
});
$c_sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__Z__I(this, (-889275714), false)
});
$c_sjs_js_JavaScriptException.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $as_sjs_js_JavaScriptException(obj) {
  return (((obj instanceof $c_sjs_js_JavaScriptException) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
}
function $isArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
}
function $asArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (($isArrayOf_sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
}
var $d_sjs_js_JavaScriptException = new $TypeData().initClass({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1
});
$c_sjs_js_JavaScriptException.prototype.$classData = $d_sjs_js_JavaScriptException;
function $is_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_Generic$MountedWithRoot)))
}
function $as_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj) {
  return (($is_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.Generic$MountedWithRoot"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_Generic$MountedWithRoot)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.Generic$MountedWithRoot;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_PackageBase$() {
  $c_Ljapgolly_scalajs_react_vdom_PackageBase.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype = new $h_Ljapgolly_scalajs_react_vdom_PackageBase();
$c_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_PackageBase$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_PackageBase$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype = $c_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype;
$c_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype.init___ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_PackageBase.prototype.init___.call(this);
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_PackageBase$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_PackageBase$: 0
}, false, "japgolly.scalajs.react.vdom.PackageBase$", {
  Ljapgolly_scalajs_react_vdom_PackageBase$: 1,
  Ljapgolly_scalajs_react_vdom_PackageBase: 1,
  Ljapgolly_scalajs_react_vdom_Exports: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_Implicits: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForTagMod: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomNode: 1
});
$c_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_PackageBase$;
var $n_Ljapgolly_scalajs_react_vdom_PackageBase$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_PackageBase$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_PackageBase$)) {
    $n_Ljapgolly_scalajs_react_vdom_PackageBase$ = new $c_Ljapgolly_scalajs_react_vdom_PackageBase$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_PackageBase$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_html$und$less$up$() {
  $c_Ljapgolly_scalajs_react_vdom_PackageBase.call(this);
  this.$$less$3 = null;
  this.$$up$3 = null
}
$c_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype = new $h_Ljapgolly_scalajs_react_vdom_PackageBase();
$c_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_html$und$less$up$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_html$und$less$up$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype = $c_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype;
$c_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype.init___ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_PackageBase.prototype.init___.call(this);
  $n_Ljapgolly_scalajs_react_vdom_html$und$less$up$ = this;
  this.$$less$3 = $m_Ljapgolly_scalajs_react_vdom_HtmlTags$();
  this.$$up$3 = $m_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$();
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_html$und$less$up$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_html$und$less$up$: 0
}, false, "japgolly.scalajs.react.vdom.html_$less$up$", {
  Ljapgolly_scalajs_react_vdom_html$und$less$up$: 1,
  Ljapgolly_scalajs_react_vdom_PackageBase: 1,
  Ljapgolly_scalajs_react_vdom_Exports: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_Implicits: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForTagMod: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomNode: 1
});
$c_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_html$und$less$up$;
var $n_Ljapgolly_scalajs_react_vdom_html$und$less$up$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_html$und$less$up$)) {
    $n_Ljapgolly_scalajs_react_vdom_html$und$less$up$ = new $c_Ljapgolly_scalajs_react_vdom_html$und$less$up$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_html$und$less$up$
}
/** @constructor */
function $c_jl_JSConsoleBasedPrintStream() {
  $c_Ljava_io_PrintStream.call(this);
  this.isErr$4 = false;
  this.flushed$4 = false;
  this.buffer$4 = null
}
$c_jl_JSConsoleBasedPrintStream.prototype = new $h_Ljava_io_PrintStream();
$c_jl_JSConsoleBasedPrintStream.prototype.constructor = $c_jl_JSConsoleBasedPrintStream;
/** @constructor */
function $h_jl_JSConsoleBasedPrintStream() {
  /*<skip>*/
}
$h_jl_JSConsoleBasedPrintStream.prototype = $c_jl_JSConsoleBasedPrintStream.prototype;
$c_jl_JSConsoleBasedPrintStream.prototype.init___Z = (function(isErr) {
  this.isErr$4 = isErr;
  var out = new $c_jl_JSConsoleBasedPrintStream$DummyOutputStream().init___();
  $c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset.call(this, out, false, null);
  this.flushed$4 = true;
  this.buffer$4 = "";
  return this
});
var $d_jl_JSConsoleBasedPrintStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream", {
  jl_JSConsoleBasedPrintStream: 1,
  Ljava_io_PrintStream: 1,
  Ljava_io_FilterOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  jl_AutoCloseable: 1,
  Ljava_io_Flushable: 1,
  jl_Appendable: 1
});
$c_jl_JSConsoleBasedPrintStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream;
/** @constructor */
function $c_s_reflect_ManifestFactory$BooleanManifest() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$BooleanManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$BooleanManifest.prototype.constructor = $c_s_reflect_ManifestFactory$BooleanManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$BooleanManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$BooleanManifest.prototype = $c_s_reflect_ManifestFactory$BooleanManifest.prototype;
$c_s_reflect_ManifestFactory$BooleanManifest.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_Z.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$BooleanManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_Z.getClassOf()
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ByteManifest() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ByteManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ByteManifest.prototype.constructor = $c_s_reflect_ManifestFactory$ByteManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$ByteManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ByteManifest.prototype = $c_s_reflect_ManifestFactory$ByteManifest.prototype;
$c_s_reflect_ManifestFactory$ByteManifest.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_B.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$ByteManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_B.getClassOf()
});
/** @constructor */
function $c_s_reflect_ManifestFactory$CharManifest() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$CharManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$CharManifest.prototype.constructor = $c_s_reflect_ManifestFactory$CharManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$CharManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$CharManifest.prototype = $c_s_reflect_ManifestFactory$CharManifest.prototype;
$c_s_reflect_ManifestFactory$CharManifest.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_C.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$CharManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_C.getClassOf()
});
/** @constructor */
function $c_s_reflect_ManifestFactory$DoubleManifest() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$DoubleManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$DoubleManifest.prototype.constructor = $c_s_reflect_ManifestFactory$DoubleManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$DoubleManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$DoubleManifest.prototype = $c_s_reflect_ManifestFactory$DoubleManifest.prototype;
$c_s_reflect_ManifestFactory$DoubleManifest.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_D.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$DoubleManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_D.getClassOf()
});
/** @constructor */
function $c_s_reflect_ManifestFactory$FloatManifest() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$FloatManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$FloatManifest.prototype.constructor = $c_s_reflect_ManifestFactory$FloatManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$FloatManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$FloatManifest.prototype = $c_s_reflect_ManifestFactory$FloatManifest.prototype;
$c_s_reflect_ManifestFactory$FloatManifest.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_F.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$FloatManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_F.getClassOf()
});
/** @constructor */
function $c_s_reflect_ManifestFactory$IntManifest() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$IntManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$IntManifest.prototype.constructor = $c_s_reflect_ManifestFactory$IntManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$IntManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$IntManifest.prototype = $c_s_reflect_ManifestFactory$IntManifest.prototype;
$c_s_reflect_ManifestFactory$IntManifest.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_I.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$IntManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_I.getClassOf()
});
/** @constructor */
function $c_s_reflect_ManifestFactory$LongManifest() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$LongManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$LongManifest.prototype.constructor = $c_s_reflect_ManifestFactory$LongManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$LongManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$LongManifest.prototype = $c_s_reflect_ManifestFactory$LongManifest.prototype;
$c_s_reflect_ManifestFactory$LongManifest.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_J.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$LongManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_J.getClassOf()
});
/** @constructor */
function $c_s_reflect_ManifestFactory$PhantomManifest() {
  $c_s_reflect_ManifestFactory$ClassTypeManifest.call(this);
  this.toString$2 = null;
  this.hashCode$2 = 0
}
$c_s_reflect_ManifestFactory$PhantomManifest.prototype = new $h_s_reflect_ManifestFactory$ClassTypeManifest();
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.constructor = $c_s_reflect_ManifestFactory$PhantomManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$PhantomManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$PhantomManifest.prototype = $c_s_reflect_ManifestFactory$PhantomManifest.prototype;
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.toString__T = (function() {
  return this.toString$2
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.hashCode__I = (function() {
  return this.hashCode$2
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ShortManifest() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ShortManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ShortManifest.prototype.constructor = $c_s_reflect_ManifestFactory$ShortManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$ShortManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ShortManifest.prototype = $c_s_reflect_ManifestFactory$ShortManifest.prototype;
$c_s_reflect_ManifestFactory$ShortManifest.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_S.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$ShortManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_S.getClassOf()
});
/** @constructor */
function $c_s_reflect_ManifestFactory$UnitManifest() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$UnitManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$UnitManifest.prototype.constructor = $c_s_reflect_ManifestFactory$UnitManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$UnitManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$UnitManifest.prototype = $c_s_reflect_ManifestFactory$UnitManifest.prototype;
$c_s_reflect_ManifestFactory$UnitManifest.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_sr_BoxedUnit.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$UnitManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_V.getClassOf()
});
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate() {
  $c_O.call(this);
  this.raw$1 = null;
  this.prevProps$1 = null;
  this.prevState$1 = null;
  this.snapshot$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate.prototype.init___Ljapgolly_scalajs_react_raw_React$Component__O__O__O = (function(raw, prevProps, prevState, snapshot) {
  this.raw$1 = raw;
  this.prevProps$1 = prevProps;
  this.prevState$1 = prevState;
  this.snapshot$1 = snapshot;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$().japgolly$scalajs$react$component$builder$Lifecycle$$wrapTostring__T__T((((((((("ComponentDidUpdate(props: " + this.prevProps$1) + " \u2192 ") + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).props__O()) + ", state: ") + this.prevState$1) + " \u2192 ") + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).state__O()) + ")"))
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$1
});
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentDidUpdate", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$StateW: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$Base: 1,
  Ljapgolly_scalajs_react_StateAccess$WriteWithProps: 1,
  Ljapgolly_scalajs_react_StateAccess$Write: 1,
  Ljapgolly_scalajs_react_StateAccess$SetState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModStateWithProps: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ForceUpdate: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidUpdate;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount() {
  $c_O.call(this);
  this.raw$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount.prototype.equals__O__Z = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$().equals$extension__Ljapgolly_scalajs_react_raw_React$Component__O__Z(this.raw$1, x$1)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount$().toString$extension__Ljapgolly_scalajs_react_raw_React$Component__T(this.raw$1)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount.prototype.init___Ljapgolly_scalajs_react_raw_React$Component = (function(raw) {
  this.raw$1 = raw;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount.prototype.hashCode__I = (function() {
  var $$this = this.raw$1;
  return $objectHashCode($$this)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$1
});
function $as_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount(obj) {
  return (((obj instanceof $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentWillMount"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.builder.Lifecycle$ComponentWillMount;", depth))
}
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentWillMount", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$StateRW: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$StateW: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$Base: 1,
  Ljapgolly_scalajs_react_StateAccess$WriteWithProps: 1,
  Ljapgolly_scalajs_react_StateAccess$Write: 1,
  Ljapgolly_scalajs_react_StateAccess$SetState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModStateWithProps: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillMount;
/** @constructor */
function $c_s_reflect_ManifestFactory$BooleanManifest$() {
  $c_s_reflect_ManifestFactory$BooleanManifest.call(this)
}
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype = new $h_s_reflect_ManifestFactory$BooleanManifest();
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$BooleanManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$BooleanManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$BooleanManifest$.prototype = $c_s_reflect_ManifestFactory$BooleanManifest$.prototype;
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.init___ = (function() {
  this.toString$1 = "Boolean";
  this.hashCode$1 = $systemIdentityHashCode(this);
  return this
});
var $d_s_reflect_ManifestFactory$BooleanManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$BooleanManifest$: 0
}, false, "scala.reflect.ManifestFactory$BooleanManifest$", {
  s_reflect_ManifestFactory$BooleanManifest$: 1,
  s_reflect_ManifestFactory$BooleanManifest: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$BooleanManifest$;
var $n_s_reflect_ManifestFactory$BooleanManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$BooleanManifest$() {
  if ((!$n_s_reflect_ManifestFactory$BooleanManifest$)) {
    $n_s_reflect_ManifestFactory$BooleanManifest$ = new $c_s_reflect_ManifestFactory$BooleanManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$BooleanManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ByteManifest$() {
  $c_s_reflect_ManifestFactory$ByteManifest.call(this)
}
$c_s_reflect_ManifestFactory$ByteManifest$.prototype = new $h_s_reflect_ManifestFactory$ByteManifest();
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ByteManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ByteManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ByteManifest$.prototype = $c_s_reflect_ManifestFactory$ByteManifest$.prototype;
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.init___ = (function() {
  this.toString$1 = "Byte";
  this.hashCode$1 = $systemIdentityHashCode(this);
  return this
});
var $d_s_reflect_ManifestFactory$ByteManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ByteManifest$: 0
}, false, "scala.reflect.ManifestFactory$ByteManifest$", {
  s_reflect_ManifestFactory$ByteManifest$: 1,
  s_reflect_ManifestFactory$ByteManifest: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ByteManifest$;
var $n_s_reflect_ManifestFactory$ByteManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ByteManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ByteManifest$)) {
    $n_s_reflect_ManifestFactory$ByteManifest$ = new $c_s_reflect_ManifestFactory$ByteManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ByteManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$CharManifest$() {
  $c_s_reflect_ManifestFactory$CharManifest.call(this)
}
$c_s_reflect_ManifestFactory$CharManifest$.prototype = new $h_s_reflect_ManifestFactory$CharManifest();
$c_s_reflect_ManifestFactory$CharManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$CharManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$CharManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$CharManifest$.prototype = $c_s_reflect_ManifestFactory$CharManifest$.prototype;
$c_s_reflect_ManifestFactory$CharManifest$.prototype.init___ = (function() {
  this.toString$1 = "Char";
  this.hashCode$1 = $systemIdentityHashCode(this);
  return this
});
var $d_s_reflect_ManifestFactory$CharManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$CharManifest$: 0
}, false, "scala.reflect.ManifestFactory$CharManifest$", {
  s_reflect_ManifestFactory$CharManifest$: 1,
  s_reflect_ManifestFactory$CharManifest: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$CharManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$CharManifest$;
var $n_s_reflect_ManifestFactory$CharManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$CharManifest$() {
  if ((!$n_s_reflect_ManifestFactory$CharManifest$)) {
    $n_s_reflect_ManifestFactory$CharManifest$ = new $c_s_reflect_ManifestFactory$CharManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$CharManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$DoubleManifest$() {
  $c_s_reflect_ManifestFactory$DoubleManifest.call(this)
}
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype = new $h_s_reflect_ManifestFactory$DoubleManifest();
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$DoubleManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$DoubleManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$DoubleManifest$.prototype = $c_s_reflect_ManifestFactory$DoubleManifest$.prototype;
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.init___ = (function() {
  this.toString$1 = "Double";
  this.hashCode$1 = $systemIdentityHashCode(this);
  return this
});
var $d_s_reflect_ManifestFactory$DoubleManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$DoubleManifest$: 0
}, false, "scala.reflect.ManifestFactory$DoubleManifest$", {
  s_reflect_ManifestFactory$DoubleManifest$: 1,
  s_reflect_ManifestFactory$DoubleManifest: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$DoubleManifest$;
var $n_s_reflect_ManifestFactory$DoubleManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$DoubleManifest$() {
  if ((!$n_s_reflect_ManifestFactory$DoubleManifest$)) {
    $n_s_reflect_ManifestFactory$DoubleManifest$ = new $c_s_reflect_ManifestFactory$DoubleManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$DoubleManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$FloatManifest$() {
  $c_s_reflect_ManifestFactory$FloatManifest.call(this)
}
$c_s_reflect_ManifestFactory$FloatManifest$.prototype = new $h_s_reflect_ManifestFactory$FloatManifest();
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$FloatManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$FloatManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$FloatManifest$.prototype = $c_s_reflect_ManifestFactory$FloatManifest$.prototype;
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.init___ = (function() {
  this.toString$1 = "Float";
  this.hashCode$1 = $systemIdentityHashCode(this);
  return this
});
var $d_s_reflect_ManifestFactory$FloatManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$FloatManifest$: 0
}, false, "scala.reflect.ManifestFactory$FloatManifest$", {
  s_reflect_ManifestFactory$FloatManifest$: 1,
  s_reflect_ManifestFactory$FloatManifest: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$FloatManifest$;
var $n_s_reflect_ManifestFactory$FloatManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$FloatManifest$() {
  if ((!$n_s_reflect_ManifestFactory$FloatManifest$)) {
    $n_s_reflect_ManifestFactory$FloatManifest$ = new $c_s_reflect_ManifestFactory$FloatManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$FloatManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$IntManifest$() {
  $c_s_reflect_ManifestFactory$IntManifest.call(this)
}
$c_s_reflect_ManifestFactory$IntManifest$.prototype = new $h_s_reflect_ManifestFactory$IntManifest();
$c_s_reflect_ManifestFactory$IntManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$IntManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$IntManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$IntManifest$.prototype = $c_s_reflect_ManifestFactory$IntManifest$.prototype;
$c_s_reflect_ManifestFactory$IntManifest$.prototype.init___ = (function() {
  this.toString$1 = "Int";
  this.hashCode$1 = $systemIdentityHashCode(this);
  return this
});
var $d_s_reflect_ManifestFactory$IntManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$IntManifest$: 0
}, false, "scala.reflect.ManifestFactory$IntManifest$", {
  s_reflect_ManifestFactory$IntManifest$: 1,
  s_reflect_ManifestFactory$IntManifest: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$IntManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$IntManifest$;
var $n_s_reflect_ManifestFactory$IntManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$IntManifest$() {
  if ((!$n_s_reflect_ManifestFactory$IntManifest$)) {
    $n_s_reflect_ManifestFactory$IntManifest$ = new $c_s_reflect_ManifestFactory$IntManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$IntManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$LongManifest$() {
  $c_s_reflect_ManifestFactory$LongManifest.call(this)
}
$c_s_reflect_ManifestFactory$LongManifest$.prototype = new $h_s_reflect_ManifestFactory$LongManifest();
$c_s_reflect_ManifestFactory$LongManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$LongManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$LongManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$LongManifest$.prototype = $c_s_reflect_ManifestFactory$LongManifest$.prototype;
$c_s_reflect_ManifestFactory$LongManifest$.prototype.init___ = (function() {
  this.toString$1 = "Long";
  this.hashCode$1 = $systemIdentityHashCode(this);
  return this
});
var $d_s_reflect_ManifestFactory$LongManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$LongManifest$: 0
}, false, "scala.reflect.ManifestFactory$LongManifest$", {
  s_reflect_ManifestFactory$LongManifest$: 1,
  s_reflect_ManifestFactory$LongManifest: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$LongManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$LongManifest$;
var $n_s_reflect_ManifestFactory$LongManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$LongManifest$() {
  if ((!$n_s_reflect_ManifestFactory$LongManifest$)) {
    $n_s_reflect_ManifestFactory$LongManifest$ = new $c_s_reflect_ManifestFactory$LongManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$LongManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NothingManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NothingManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NothingManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NothingManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NothingManifest$.prototype = $c_s_reflect_ManifestFactory$NothingManifest$.prototype;
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.init___ = (function() {
  this.toString$2 = "Nothing";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Nothing$.getClassOf();
  this.typeArguments$1 = typeArguments;
  this.hashCode$2 = $systemIdentityHashCode(this);
  return this
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_sr_Nothing$.getClassOf()
});
var $d_s_reflect_ManifestFactory$NothingManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NothingManifest$: 0
}, false, "scala.reflect.ManifestFactory$NothingManifest$", {
  s_reflect_ManifestFactory$NothingManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NothingManifest$;
var $n_s_reflect_ManifestFactory$NothingManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NothingManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NothingManifest$)) {
    $n_s_reflect_ManifestFactory$NothingManifest$ = new $c_s_reflect_ManifestFactory$NothingManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NothingManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NullManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NullManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NullManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NullManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NullManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NullManifest$.prototype = $c_s_reflect_ManifestFactory$NullManifest$.prototype;
$c_s_reflect_ManifestFactory$NullManifest$.prototype.init___ = (function() {
  this.toString$2 = "Null";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Null$.getClassOf();
  this.typeArguments$1 = typeArguments;
  this.hashCode$2 = $systemIdentityHashCode(this);
  return this
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_sr_Null$.getClassOf()
});
var $d_s_reflect_ManifestFactory$NullManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NullManifest$: 0
}, false, "scala.reflect.ManifestFactory$NullManifest$", {
  s_reflect_ManifestFactory$NullManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NullManifest$;
var $n_s_reflect_ManifestFactory$NullManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NullManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NullManifest$)) {
    $n_s_reflect_ManifestFactory$NullManifest$ = new $c_s_reflect_ManifestFactory$NullManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NullManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ObjectManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ObjectManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ObjectManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ObjectManifest$.prototype = $c_s_reflect_ManifestFactory$ObjectManifest$.prototype;
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.init___ = (function() {
  this.toString$2 = "Object";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  this.hashCode$2 = $systemIdentityHashCode(this);
  return this
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_O.getClassOf()
});
var $d_s_reflect_ManifestFactory$ObjectManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ObjectManifest$: 0
}, false, "scala.reflect.ManifestFactory$ObjectManifest$", {
  s_reflect_ManifestFactory$ObjectManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ObjectManifest$;
var $n_s_reflect_ManifestFactory$ObjectManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ObjectManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ObjectManifest$)) {
    $n_s_reflect_ManifestFactory$ObjectManifest$ = new $c_s_reflect_ManifestFactory$ObjectManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ObjectManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ShortManifest$() {
  $c_s_reflect_ManifestFactory$ShortManifest.call(this)
}
$c_s_reflect_ManifestFactory$ShortManifest$.prototype = new $h_s_reflect_ManifestFactory$ShortManifest();
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ShortManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ShortManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ShortManifest$.prototype = $c_s_reflect_ManifestFactory$ShortManifest$.prototype;
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.init___ = (function() {
  this.toString$1 = "Short";
  this.hashCode$1 = $systemIdentityHashCode(this);
  return this
});
var $d_s_reflect_ManifestFactory$ShortManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ShortManifest$: 0
}, false, "scala.reflect.ManifestFactory$ShortManifest$", {
  s_reflect_ManifestFactory$ShortManifest$: 1,
  s_reflect_ManifestFactory$ShortManifest: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ShortManifest$;
var $n_s_reflect_ManifestFactory$ShortManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ShortManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ShortManifest$)) {
    $n_s_reflect_ManifestFactory$ShortManifest$ = new $c_s_reflect_ManifestFactory$ShortManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ShortManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$UnitManifest$() {
  $c_s_reflect_ManifestFactory$UnitManifest.call(this)
}
$c_s_reflect_ManifestFactory$UnitManifest$.prototype = new $h_s_reflect_ManifestFactory$UnitManifest();
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$UnitManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$UnitManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$UnitManifest$.prototype = $c_s_reflect_ManifestFactory$UnitManifest$.prototype;
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.init___ = (function() {
  this.toString$1 = "Unit";
  this.hashCode$1 = $systemIdentityHashCode(this);
  return this
});
var $d_s_reflect_ManifestFactory$UnitManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$UnitManifest$: 0
}, false, "scala.reflect.ManifestFactory$UnitManifest$", {
  s_reflect_ManifestFactory$UnitManifest$: 1,
  s_reflect_ManifestFactory$UnitManifest: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$UnitManifest$;
var $n_s_reflect_ManifestFactory$UnitManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$UnitManifest$() {
  if ((!$n_s_reflect_ManifestFactory$UnitManifest$)) {
    $n_s_reflect_ManifestFactory$UnitManifest$ = new $c_s_reflect_ManifestFactory$UnitManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$UnitManifest$
}
/** @constructor */
function $c_sc_AbstractView() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractView.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractView.prototype.constructor = $c_sc_AbstractView;
/** @constructor */
function $h_sc_AbstractView() {
  /*<skip>*/
}
$h_sc_AbstractView.prototype = $c_sc_AbstractView.prototype;
$c_sc_AbstractView.prototype.toString__T = (function() {
  return $f_sc_View__toString__T(this)
});
$c_sc_AbstractView.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_sc_View$()
});
$c_sc_AbstractView.prototype.stringPrefix__T = (function() {
  return "View"
});
function $f_sc_Seq__equals__O__Z($thiz, o) {
  if (($thiz === o)) {
    return true
  } else if ($is_sc_Seq(o)) {
    var x2 = $as_sc_Seq(o);
    return ((x2 === $thiz) || (x2.canEqual__O__Z($thiz) && $thiz.sameElements__sc_IterableOnce__Z(x2)))
  } else {
    return false
  }
}
function $is_sc_Seq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Seq)))
}
function $as_sc_Seq(obj) {
  return (($is_sc_Seq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Seq"))
}
function $isArrayOf_sc_Seq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Seq)))
}
function $asArrayOf_sc_Seq(obj, depth) {
  return (($isArrayOf_sc_Seq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Seq;", depth))
}
function $is_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_Js$MountedWithRoot)))
}
function $as_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj) {
  return (($is_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.Js$MountedWithRoot"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_Js$MountedWithRoot)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.Js$MountedWithRoot;", depth))
}
function $is_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_Scala$MountedWithRoot)))
}
function $as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj) {
  return (($is_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.Scala$MountedWithRoot"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_Scala$MountedWithRoot)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.Scala$MountedWithRoot;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Template$MountedMapped() {
  $c_O.call(this);
  this.from$1 = null;
  this.mp$1 = null;
  this.ls$1 = null;
  this.ft$1 = null
}
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Template$MountedMapped;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Template$MountedMapped() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype = $c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype;
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.withEffect__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot = (function(t) {
  return this.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(this.mp$1, this.ls$1, this.ft$1.compose__Ljapgolly_scalajs_react_internal_Effect$Trans__s_$less$colon$less__Ljapgolly_scalajs_react_internal_Effect$Trans(t, null))
});
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.props__O = (function() {
  return this.ft$1.apply__F0__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this.mp$1.apply__O__O($this.from$1.props__O())
    })
  })(this)))
});
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.init___Ljapgolly_scalajs_react_component_Generic$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans = (function(from, mp, ls, ft) {
  this.from$1 = from;
  this.mp$1 = mp;
  this.ls$1 = ls;
  this.ft$1 = ft;
  return this
});
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.state__O = (function() {
  return this.ft$1.apply__F0__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this.ls$1.get$1.apply__O__O($this.from$1.state__O())
    })
  })(this)))
});
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot() {
  $c_O.call(this);
  this.ft$1 = null
}
$c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Template$MountedWithRoot() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype = $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype;
$c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype.withEffect__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot = (function(t) {
  var jsx$1 = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  var this$1 = $m_Ljapgolly_scalajs_react_internal_Lens$();
  return this.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(jsx$1, this$1.idInstance$1, this.ft$1.compose__Ljapgolly_scalajs_react_internal_Effect$Trans__s_$less$colon$less__Ljapgolly_scalajs_react_internal_Effect$Trans(t, null))
});
$c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype.init___Ljapgolly_scalajs_react_internal_Effect$Trans = (function(ft) {
  this.ft$1 = ft;
  return this
});
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch() {
  $c_O.call(this);
  this.raw$1 = null;
  this.error$1 = null;
  this.info$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$().japgolly$scalajs$react$component$builder$Lifecycle$$wrapTostring__T__T((("ComponentDidCatch(" + this.error$1) + ")"))
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch.prototype.init___Ljapgolly_scalajs_react_raw_React$Component__Ljapgolly_scalajs_react_raw_React$Error__Ljapgolly_scalajs_react_raw_React$ErrorInfo = (function(raw, error, info) {
  this.raw$1 = raw;
  this.error$1 = error;
  this.info$1 = info;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$1
});
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentDidCatch", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$StateRW: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$StateW: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$Base: 1,
  Ljapgolly_scalajs_react_StateAccess$WriteWithProps: 1,
  Ljapgolly_scalajs_react_StateAccess$Write: 1,
  Ljapgolly_scalajs_react_StateAccess$SetState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModStateWithProps: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ForceUpdate: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidCatch;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount() {
  $c_O.call(this);
  this.raw$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount.prototype.equals__O__Z = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$().equals$extension__Ljapgolly_scalajs_react_raw_React$Component__O__Z(this.raw$1, x$1)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount$().toString$extension__Ljapgolly_scalajs_react_raw_React$Component__T(this.raw$1)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount.prototype.init___Ljapgolly_scalajs_react_raw_React$Component = (function(raw) {
  this.raw$1 = raw;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount.prototype.hashCode__I = (function() {
  var $$this = this.raw$1;
  return $objectHashCode($$this)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$1
});
function $as_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount(obj) {
  return (((obj instanceof $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentDidMount"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.builder.Lifecycle$ComponentDidMount;", depth))
}
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentDidMount", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$StateRW: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$StateW: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$Base: 1,
  Ljapgolly_scalajs_react_StateAccess$WriteWithProps: 1,
  Ljapgolly_scalajs_react_StateAccess$Write: 1,
  Ljapgolly_scalajs_react_StateAccess$SetState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModStateWithProps: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ForceUpdate: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentDidMount;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps() {
  $c_O.call(this);
  this.raw$1 = null;
  this.nextProps$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps.prototype.init___Ljapgolly_scalajs_react_raw_React$Component__O = (function(raw, nextProps) {
  this.raw$1 = raw;
  this.nextProps$1 = nextProps;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$().japgolly$scalajs$react$component$builder$Lifecycle$$wrapTostring__T__T((((((("ComponentWillReceiveProps(props: " + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).props__O()) + " \u2192 ") + this.nextProps$1) + ", state: ") + $f_Ljapgolly_scalajs_react_component_builder_Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).state__O()) + ")"))
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$1
});
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$ComponentWillReceiveProps", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$StateRW: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$StateW: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$Base: 1,
  Ljapgolly_scalajs_react_StateAccess$WriteWithProps: 1,
  Ljapgolly_scalajs_react_StateAccess$Write: 1,
  Ljapgolly_scalajs_react_StateAccess$SetState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModStateWithProps: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ForceUpdate: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$ComponentWillReceiveProps;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope() {
  $c_O.call(this);
  this.raw$1 = null
}
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope.prototype.constructor = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope.prototype = $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope.prototype;
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope.prototype.equals__O__Z = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$().equals$extension__Ljapgolly_scalajs_react_raw_React$Component__O__Z(this.raw$1, x$1)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope$().toString$extension__Ljapgolly_scalajs_react_raw_React$Component__T(this.raw$1)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope.prototype.init___Ljapgolly_scalajs_react_raw_React$Component = (function(raw) {
  this.raw$1 = raw;
  return this
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope.prototype.hashCode__I = (function() {
  var $$this = this.raw$1;
  return $objectHashCode($$this)
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$1
});
function $as_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope(obj) {
  return (((obj instanceof $c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.builder.Lifecycle$RenderScope"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.builder.Lifecycle$RenderScope;", depth))
}
var $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope: 0
}, false, "japgolly.scalajs.react.component.builder.Lifecycle$RenderScope", {
  Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$StateRW: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$StateW: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$Base: 1,
  Ljapgolly_scalajs_react_StateAccess$WriteWithProps: 1,
  Ljapgolly_scalajs_react_StateAccess$Write: 1,
  Ljapgolly_scalajs_react_StateAccess$SetState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModStateWithProps: 1,
  Ljapgolly_scalajs_react_component_builder_Lifecycle$ForceUpdate: 1
});
$c_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope.prototype.$classData = $d_Ljapgolly_scalajs_react_component_builder_Lifecycle$RenderScope;
function $f_sc_Map__equals__O__Z($thiz, o) {
  if ($is_sc_Map(o)) {
    var x2 = $as_sc_Map(o);
    if (($thiz === x2)) {
      return true
    } else if (($f_sc_IterableOnceOps__size__I($thiz) === $f_sc_IterableOnceOps__size__I(x2))) {
      try {
        var res = true;
        var it = new $c_sjs_js_WrappedDictionary$DictionaryIterator().init___sjs_js_Dictionary($thiz.dict$4);
        while ((res && it.hasNext__Z())) {
          var arg1 = it.next__T2();
          if ((arg1 === null)) {
            throw new $c_s_MatchError().init___O(arg1)
          };
          var k = arg1.$$und1$f;
          var v = arg1.$$und2$f;
          var jsx$2 = $m_sr_BoxesRunTime$();
          var x1 = x2.get__T__s_Option($as_T(k));
          if ((x1 instanceof $c_s_Some)) {
            var x2$1 = $as_s_Some(x1);
            var v$1 = x2$1.value$2;
            var jsx$1 = v$1
          } else {
            var x = $m_s_None$();
            if ((!(x === x1))) {
              throw new $c_s_MatchError().init___O(x1)
            };
            var jsx$1 = $m_sc_Map$().scala$collection$Map$$DefaultSentinel$2
          };
          res = jsx$2.equals__O__O__Z(jsx$1, v)
        };
        return res
      } catch (e) {
        if ((e instanceof $c_jl_ClassCastException)) {
          return false
        } else {
          throw e
        }
      }
    } else {
      return false
    }
  } else {
    return false
  }
}
function $is_sc_Map(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Map)))
}
function $as_sc_Map(obj) {
  return (($is_sc_Map(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Map"))
}
function $isArrayOf_sc_Map(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Map)))
}
function $asArrayOf_sc_Map(obj, depth) {
  return (($isArrayOf_sc_Map(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Map;", depth))
}
/** @constructor */
function $c_sc_View$$anon$1() {
  $c_sc_AbstractView.call(this);
  this.it$1$3 = null
}
$c_sc_View$$anon$1.prototype = new $h_sc_AbstractView();
$c_sc_View$$anon$1.prototype.constructor = $c_sc_View$$anon$1;
/** @constructor */
function $h_sc_View$$anon$1() {
  /*<skip>*/
}
$h_sc_View$$anon$1.prototype = $c_sc_View$$anon$1.prototype;
$c_sc_View$$anon$1.prototype.init___F0 = (function(it$1) {
  this.it$1$3 = it$1;
  return this
});
$c_sc_View$$anon$1.prototype.iterator__sc_Iterator = (function() {
  return $as_sc_Iterator(this.it$1$3.apply__O())
});
var $d_sc_View$$anon$1 = new $TypeData().initClass({
  sc_View$$anon$1: 0
}, false, "scala.collection.View$$anon$1", {
  sc_View$$anon$1: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_View: 1,
  Ljava_io_Serializable: 1
});
$c_sc_View$$anon$1.prototype.$classData = $d_sc_View$$anon$1;
/** @constructor */
function $c_sc_View$Concat() {
  $c_sc_AbstractView.call(this);
  this.prefix$3 = null;
  this.suffix$3 = null
}
$c_sc_View$Concat.prototype = new $h_sc_AbstractView();
$c_sc_View$Concat.prototype.constructor = $c_sc_View$Concat;
/** @constructor */
function $h_sc_View$Concat() {
  /*<skip>*/
}
$h_sc_View$Concat.prototype = $c_sc_View$Concat.prototype;
$c_sc_View$Concat.prototype.init___sc_IterableOps__sc_IterableOps = (function(prefix, suffix) {
  this.prefix$3 = prefix;
  this.suffix$3 = suffix;
  return this
});
$c_sc_View$Concat.prototype.isEmpty__Z = (function() {
  return (this.prefix$3.isEmpty__Z() && this.suffix$3.isEmpty__Z())
});
$c_sc_View$Concat.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.prefix$3.iterator__sc_Iterator();
  var xs = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this.suffix$3.iterator__sc_Iterator()
    })
  })(this));
  return this$1.concat__F0__sc_Iterator(xs)
});
$c_sc_View$Concat.prototype.knownSize__I = (function() {
  var prefixSize = this.prefix$3.knownSize__I();
  if ((prefixSize >= 0)) {
    var suffixSize = this.suffix$3.knownSize__I();
    return ((suffixSize >= 0) ? ((prefixSize + suffixSize) | 0) : (-1))
  } else {
    return (-1)
  }
});
var $d_sc_View$Concat = new $TypeData().initClass({
  sc_View$Concat: 0
}, false, "scala.collection.View$Concat", {
  sc_View$Concat: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_View: 1,
  Ljava_io_Serializable: 1
});
$c_sc_View$Concat.prototype.$classData = $d_sc_View$Concat;
/** @constructor */
function $c_sc_View$Drop() {
  $c_sc_AbstractView.call(this);
  this.underlying$3 = null;
  this.n$3 = 0;
  this.normN$3 = 0
}
$c_sc_View$Drop.prototype = new $h_sc_AbstractView();
$c_sc_View$Drop.prototype.constructor = $c_sc_View$Drop;
/** @constructor */
function $h_sc_View$Drop() {
  /*<skip>*/
}
$h_sc_View$Drop.prototype = $c_sc_View$Drop.prototype;
$c_sc_View$Drop.prototype.isEmpty__Z = (function() {
  var this$1 = this.iterator__sc_Iterator();
  return $f_sc_Iterator__isEmpty__Z(this$1)
});
$c_sc_View$Drop.prototype.iterator__sc_Iterator = (function() {
  return this.underlying$3.iterator__sc_Iterator().drop__I__sc_Iterator(this.n$3)
});
$c_sc_View$Drop.prototype.init___sc_IterableOps__I = (function(underlying, n) {
  this.underlying$3 = underlying;
  this.n$3 = n;
  this.normN$3 = ((n > 0) ? n : 0);
  return this
});
$c_sc_View$Drop.prototype.knownSize__I = (function() {
  var size = this.underlying$3.knownSize__I();
  if ((size >= 0)) {
    var x = ((size - this.normN$3) | 0);
    return ((x > 0) ? x : 0)
  } else {
    return (-1)
  }
});
var $d_sc_View$Drop = new $TypeData().initClass({
  sc_View$Drop: 0
}, false, "scala.collection.View$Drop", {
  sc_View$Drop: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_View: 1,
  Ljava_io_Serializable: 1
});
$c_sc_View$Drop.prototype.$classData = $d_sc_View$Drop;
/** @constructor */
function $c_sc_View$Filter() {
  $c_sc_AbstractView.call(this);
  this.underlying$3 = null;
  this.p$3 = null;
  this.isFlipped$3 = false
}
$c_sc_View$Filter.prototype = new $h_sc_AbstractView();
$c_sc_View$Filter.prototype.constructor = $c_sc_View$Filter;
/** @constructor */
function $h_sc_View$Filter() {
  /*<skip>*/
}
$h_sc_View$Filter.prototype = $c_sc_View$Filter.prototype;
$c_sc_View$Filter.prototype.init___sc_IterableOps__F1__Z = (function(underlying, p, isFlipped) {
  this.underlying$3 = underlying;
  this.p$3 = p;
  this.isFlipped$3 = isFlipped;
  return this
});
$c_sc_View$Filter.prototype.isEmpty__Z = (function() {
  var this$1 = this.iterator__sc_Iterator();
  return $f_sc_Iterator__isEmpty__Z(this$1)
});
$c_sc_View$Filter.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.underlying$3.iterator__sc_Iterator();
  var p = this.p$3;
  var isFlipped = this.isFlipped$3;
  return new $c_sc_Iterator$$anon$6().init___sc_Iterator__F1__Z(this$1, p, isFlipped)
});
$c_sc_View$Filter.prototype.knownSize__I = (function() {
  return ((this.underlying$3.knownSize__I() === 0) ? 0 : (-1))
});
var $d_sc_View$Filter = new $TypeData().initClass({
  sc_View$Filter: 0
}, false, "scala.collection.View$Filter", {
  sc_View$Filter: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_View: 1,
  Ljava_io_Serializable: 1
});
$c_sc_View$Filter.prototype.$classData = $d_sc_View$Filter;
/** @constructor */
function $c_sc_View$Prepended() {
  $c_sc_AbstractView.call(this);
  this.elem$3 = null;
  this.underlying$3 = null
}
$c_sc_View$Prepended.prototype = new $h_sc_AbstractView();
$c_sc_View$Prepended.prototype.constructor = $c_sc_View$Prepended;
/** @constructor */
function $h_sc_View$Prepended() {
  /*<skip>*/
}
$h_sc_View$Prepended.prototype = $c_sc_View$Prepended.prototype;
$c_sc_View$Prepended.prototype.init___O__sc_IterableOps = (function(elem, underlying) {
  this.elem$3 = elem;
  this.underlying$3 = underlying;
  return this
});
function $is_sc_IndexedSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)))
}
function $as_sc_IndexedSeq(obj) {
  return (($is_sc_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeq"))
}
function $isArrayOf_sc_IndexedSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)))
}
function $asArrayOf_sc_IndexedSeq(obj, depth) {
  return (($isArrayOf_sc_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeq;", depth))
}
function $is_sc_LinearSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)))
}
function $as_sc_LinearSeq(obj) {
  return (($is_sc_LinearSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeq"))
}
function $isArrayOf_sc_LinearSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)))
}
function $asArrayOf_sc_LinearSeq(obj, depth) {
  return (($isArrayOf_sc_LinearSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeq;", depth))
}
/** @constructor */
function $c_sc_AbstractSeq() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractSeq.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSeq.prototype.constructor = $c_sc_AbstractSeq;
/** @constructor */
function $h_sc_AbstractSeq() {
  /*<skip>*/
}
$h_sc_AbstractSeq.prototype = $c_sc_AbstractSeq.prototype;
$c_sc_AbstractSeq.prototype.compose__F1__F1 = (function(g) {
  return $f_F1__compose__F1__F1(this, g)
});
$c_sc_AbstractSeq.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IterableOps__sizeCompare__I__I(this, len)
});
$c_sc_AbstractSeq.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqOps__isEmpty__Z(this)
});
$c_sc_AbstractSeq.prototype.sameElements__sc_IterableOnce__Z = (function(that) {
  return $f_sc_SeqOps__sameElements__sc_IterableOnce__Z(this, that)
});
$c_sc_AbstractSeq.prototype.equals__O__Z = (function(o) {
  return $f_sc_Seq__equals__O__Z(this, o)
});
$c_sc_AbstractSeq.prototype.toString__T = (function() {
  return $f_sc_Iterable__toString__T(this)
});
$c_sc_AbstractSeq.prototype.canEqual__O__Z = (function(that) {
  return true
});
$c_sc_AbstractSeq.prototype.prependedAll__sc_IterableOnce__O = (function(prefix) {
  return $f_sc_SeqOps__prependedAll__sc_IterableOnce__O(this, prefix)
});
$c_sc_AbstractSeq.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
/** @constructor */
function $c_sc_AbstractSeqView() {
  $c_sc_AbstractView.call(this)
}
$c_sc_AbstractSeqView.prototype = new $h_sc_AbstractView();
$c_sc_AbstractSeqView.prototype.constructor = $c_sc_AbstractSeqView;
/** @constructor */
function $h_sc_AbstractSeqView() {
  /*<skip>*/
}
$h_sc_AbstractSeqView.prototype = $c_sc_AbstractSeqView.prototype;
$c_sc_AbstractSeqView.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IterableOps__sizeCompare__I__I(this, len)
});
$c_sc_AbstractSeqView.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqOps__isEmpty__Z(this)
});
$c_sc_AbstractSeqView.prototype.drop__I__sc_SeqView = (function(n) {
  return new $c_sc_SeqView$Drop().init___sc_SeqOps__I(this, n)
});
$c_sc_AbstractSeqView.prototype.drop__I__O = (function(n) {
  return this.drop__I__sc_SeqView(n)
});
$c_sc_AbstractSeqView.prototype.stringPrefix__T = (function() {
  return "SeqView"
});
function $is_sci_Seq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Seq)))
}
function $as_sci_Seq(obj) {
  return (($is_sci_Seq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Seq"))
}
function $isArrayOf_sci_Seq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Seq)))
}
function $asArrayOf_sci_Seq(obj, depth) {
  return (($isArrayOf_sci_Seq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Seq;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Js$$anon$3() {
  $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.call(this);
  this.raw$2 = null
}
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype = new $h_Ljapgolly_scalajs_react_component_Template$MountedWithRoot();
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Js$$anon$3;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Js$$anon$3() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype = $c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype;
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot = (function(mp, ls, ft) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$4().init___Ljapgolly_scalajs_react_component_Js$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans(this, mp, ls, ft)
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.props__sjs_js_Object = (function() {
  return this.raw$2.props
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.props__O = (function() {
  return this.props__sjs_js_Object()
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.init___Ljapgolly_scalajs_react_raw_React$Component = (function(r$2) {
  $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype.init___Ljapgolly_scalajs_react_internal_Effect$Trans.call(this, $m_Ljapgolly_scalajs_react_internal_Effect$Trans$().endoId$1);
  this.raw$2 = r$2;
  return this
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.state__O = (function() {
  return this.state__sjs_js_Object()
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.state__sjs_js_Object = (function() {
  return this.raw$2.state
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$2
});
var $d_Ljapgolly_scalajs_react_component_Js$$anon$3 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Js$$anon$3: 0
}, false, "japgolly.scalajs.react.component.Js$$anon$3", {
  Ljapgolly_scalajs_react_component_Js$$anon$3: 1,
  Ljapgolly_scalajs_react_component_Template$MountedWithRoot: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedRaw: 1,
  Ljapgolly_scalajs_react_StateAccess: 1,
  Ljapgolly_scalajs_react_StateAccess$Write: 1,
  Ljapgolly_scalajs_react_StateAccess$SetState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModState: 1,
  Ljapgolly_scalajs_react_StateAccess$WriteWithProps: 1,
  Ljapgolly_scalajs_react_StateAccess$ModStateWithProps: 1,
  Ljapgolly_scalajs_react_component_Js$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Js$MountedSimple: 1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Js$$anon$3;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Js$$anon$4() {
  $c_Ljapgolly_scalajs_react_component_Template$MountedMapped.call(this);
  this.raw$2 = null;
  this.from$2$2 = null;
  this.ft$1$2 = null
}
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype = new $h_Ljapgolly_scalajs_react_component_Template$MountedMapped();
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Js$$anon$4;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Js$$anon$4() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype = $c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype;
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Js$MountedWithRoot = (function(mp, ls, ft) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  var from = this.from$2$2;
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$4().init___Ljapgolly_scalajs_react_component_Js$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans(from, mp, ls, ft)
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot = (function(mp, ls, ft) {
  return this.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Js$MountedWithRoot(mp, ls, ft)
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.init___Ljapgolly_scalajs_react_component_Js$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans = (function(from$2, mp$2, ls$1, ft$1) {
  this.from$2$2 = from$2;
  this.ft$1$2 = ft$1;
  $c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.init___Ljapgolly_scalajs_react_component_Generic$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans.call(this, from$2, mp$2, ls$1, ft$1);
  this.raw$2 = from$2.raw__Ljapgolly_scalajs_react_raw_React$Component();
  return this
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$2
});
var $d_Ljapgolly_scalajs_react_component_Js$$anon$4 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Js$$anon$4: 0
}, false, "japgolly.scalajs.react.component.Js$$anon$4", {
  Ljapgolly_scalajs_react_component_Js$$anon$4: 1,
  Ljapgolly_scalajs_react_component_Template$MountedMapped: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedRaw: 1,
  Ljapgolly_scalajs_react_StateAccess: 1,
  Ljapgolly_scalajs_react_StateAccess$Write: 1,
  Ljapgolly_scalajs_react_StateAccess$SetState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModState: 1,
  Ljapgolly_scalajs_react_StateAccess$WriteWithProps: 1,
  Ljapgolly_scalajs_react_StateAccess$ModStateWithProps: 1,
  Ljapgolly_scalajs_react_component_Js$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Js$MountedSimple: 1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Js$$anon$4;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Scala$$anon$1() {
  $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.call(this);
  this.js$2 = null;
  this.raw$2 = null;
  this.x$1$2 = null
}
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype = new $h_Ljapgolly_scalajs_react_component_Template$MountedWithRoot();
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Scala$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Scala$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype = $c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.js__Ljapgolly_scalajs_react_component_Js$MountedWithRoot = (function() {
  return this.js$2
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot = (function(mp, ls, ft) {
  $m_Ljapgolly_scalajs_react_component_Scala$();
  return new $c_Ljapgolly_scalajs_react_component_Scala$$anon$2().init___Ljapgolly_scalajs_react_component_Scala$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans(this, mp, ls, ft)
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.props__O = (function() {
  return this.x$1$2.props__O().a
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.state__O = (function() {
  return this.x$1$2.state__O().a
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.init___Ljapgolly_scalajs_react_component_Js$MountedWithRoot = (function(x$1) {
  this.x$1$2 = x$1;
  $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype.init___Ljapgolly_scalajs_react_internal_Effect$Trans.call(this, $m_Ljapgolly_scalajs_react_internal_Effect$Trans$().endoId$1);
  this.js$2 = x$1;
  this.raw$2 = x$1.raw__Ljapgolly_scalajs_react_raw_React$Component();
  return this
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$2
});
var $d_Ljapgolly_scalajs_react_component_Scala$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Scala$$anon$1: 0
}, false, "japgolly.scalajs.react.component.Scala$$anon$1", {
  Ljapgolly_scalajs_react_component_Scala$$anon$1: 1,
  Ljapgolly_scalajs_react_component_Template$MountedWithRoot: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedRaw: 1,
  Ljapgolly_scalajs_react_StateAccess: 1,
  Ljapgolly_scalajs_react_StateAccess$Write: 1,
  Ljapgolly_scalajs_react_StateAccess$SetState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModState: 1,
  Ljapgolly_scalajs_react_StateAccess$WriteWithProps: 1,
  Ljapgolly_scalajs_react_StateAccess$ModStateWithProps: 1,
  Ljapgolly_scalajs_react_component_Scala$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Scala$MountedSimple: 1
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Scala$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Scala$$anon$2() {
  $c_Ljapgolly_scalajs_react_component_Template$MountedMapped.call(this);
  this.js$2 = null;
  this.raw$2 = null;
  this.from$1$2 = null;
  this.ft$1$2 = null
}
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype = new $h_Ljapgolly_scalajs_react_component_Template$MountedMapped();
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Scala$$anon$2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Scala$$anon$2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype = $c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.js__Ljapgolly_scalajs_react_component_Js$MountedWithRoot = (function() {
  return this.js$2
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.init___Ljapgolly_scalajs_react_component_Scala$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans = (function(from$1, mp$1, ls$1, ft$1) {
  this.from$1$2 = from$1;
  this.ft$1$2 = ft$1;
  $c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.init___Ljapgolly_scalajs_react_component_Generic$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans.call(this, from$1, mp$1, ls$1, ft$1);
  this.js$2 = from$1.js__Ljapgolly_scalajs_react_component_Js$MountedWithRoot();
  this.raw$2 = from$1.raw__Ljapgolly_scalajs_react_raw_React$Component();
  return this
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot = (function(mp, ls, ft) {
  return this.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(mp, ls, ft)
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot = (function(mp, ls, ft) {
  $m_Ljapgolly_scalajs_react_component_Scala$();
  var from = this.from$1$2;
  return new $c_Ljapgolly_scalajs_react_component_Scala$$anon$2().init___Ljapgolly_scalajs_react_component_Scala$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans(from, mp, ls, ft)
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.raw__Ljapgolly_scalajs_react_raw_React$Component = (function() {
  return this.raw$2
});
var $d_Ljapgolly_scalajs_react_component_Scala$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Scala$$anon$2: 0
}, false, "japgolly.scalajs.react.component.Scala$$anon$2", {
  Ljapgolly_scalajs_react_component_Scala$$anon$2: 1,
  Ljapgolly_scalajs_react_component_Template$MountedMapped: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedRaw: 1,
  Ljapgolly_scalajs_react_StateAccess: 1,
  Ljapgolly_scalajs_react_StateAccess$Write: 1,
  Ljapgolly_scalajs_react_StateAccess$SetState: 1,
  Ljapgolly_scalajs_react_StateAccess$ModState: 1,
  Ljapgolly_scalajs_react_StateAccess$WriteWithProps: 1,
  Ljapgolly_scalajs_react_StateAccess$ModStateWithProps: 1,
  Ljapgolly_scalajs_react_component_Scala$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Scala$MountedSimple: 1
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Scala$$anon$2;
/** @constructor */
function $c_sc_AbstractMap() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractMap.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractMap.prototype.constructor = $c_sc_AbstractMap;
/** @constructor */
function $h_sc_AbstractMap() {
  /*<skip>*/
}
$h_sc_AbstractMap.prototype = $c_sc_AbstractMap.prototype;
$c_sc_AbstractMap.prototype.compose__F1__F1 = (function(g) {
  return $f_F1__compose__F1__F1(this, g)
});
$c_sc_AbstractMap.prototype.equals__O__Z = (function(o) {
  return $f_sc_Map__equals__O__Z(this, o)
});
$c_sc_AbstractMap.prototype.toString__T = (function() {
  return $f_sc_Iterable__toString__T(this)
});
$c_sc_AbstractMap.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(sb, start, sep, end) {
  return $f_sc_MapOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, sb, start, sep, end)
});
$c_sc_AbstractMap.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().mapHash__sc_Map__I(this)
});
$c_sc_AbstractMap.prototype.stringPrefix__T = (function() {
  return "Map"
});
/** @constructor */
function $c_sc_SeqView$Drop() {
  $c_sc_View$Drop.call(this);
  this.underlying$4 = null;
  this.n$4 = 0
}
$c_sc_SeqView$Drop.prototype = new $h_sc_View$Drop();
$c_sc_SeqView$Drop.prototype.constructor = $c_sc_SeqView$Drop;
/** @constructor */
function $h_sc_SeqView$Drop() {
  /*<skip>*/
}
$h_sc_SeqView$Drop.prototype = $c_sc_SeqView$Drop.prototype;
$c_sc_SeqView$Drop.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IterableOps__sizeCompare__I__I(this, len)
});
$c_sc_SeqView$Drop.prototype.apply__I__O = (function(i) {
  return this.underlying$4.apply__I__O(((i + this.normN$3) | 0))
});
$c_sc_SeqView$Drop.prototype.init___sc_SeqOps__I = (function(underlying, n) {
  this.underlying$4 = underlying;
  this.n$4 = n;
  $c_sc_View$Drop.prototype.init___sc_IterableOps__I.call(this, underlying, n);
  return this
});
$c_sc_SeqView$Drop.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqOps__isEmpty__Z(this)
});
$c_sc_SeqView$Drop.prototype.drop__I__sc_SeqView = (function(n) {
  return new $c_sc_SeqView$Drop().init___sc_SeqOps__I(this.underlying$4, ((this.n$4 + n) | 0))
});
$c_sc_SeqView$Drop.prototype.length__I = (function() {
  var this$1 = this.underlying$4;
  var x = ((this$1.length__I() - this.normN$3) | 0);
  return ((x > 0) ? x : 0)
});
$c_sc_SeqView$Drop.prototype.drop__I__O = (function(n) {
  return this.drop__I__sc_SeqView(n)
});
$c_sc_SeqView$Drop.prototype.stringPrefix__T = (function() {
  return "SeqView"
});
var $d_sc_SeqView$Drop = new $TypeData().initClass({
  sc_SeqView$Drop: 0
}, false, "scala.collection.SeqView$Drop", {
  sc_SeqView$Drop: 1,
  sc_View$Drop: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_View: 1,
  Ljava_io_Serializable: 1,
  sc_SeqView: 1,
  sc_SeqOps: 1
});
$c_sc_SeqView$Drop.prototype.$classData = $d_sc_SeqView$Drop;
/** @constructor */
function $c_sc_SeqView$Id() {
  $c_sc_AbstractSeqView.call(this);
  this.underlying$4 = null
}
$c_sc_SeqView$Id.prototype = new $h_sc_AbstractSeqView();
$c_sc_SeqView$Id.prototype.constructor = $c_sc_SeqView$Id;
/** @constructor */
function $h_sc_SeqView$Id() {
  /*<skip>*/
}
$h_sc_SeqView$Id.prototype = $c_sc_SeqView$Id.prototype;
$c_sc_SeqView$Id.prototype.init___sc_SeqOps = (function(underlying) {
  this.underlying$4 = underlying;
  return this
});
$c_sc_SeqView$Id.prototype.apply__I__O = (function(idx) {
  return this.underlying$4.apply__I__O(idx)
});
$c_sc_SeqView$Id.prototype.isEmpty__Z = (function() {
  return this.underlying$4.isEmpty__Z()
});
$c_sc_SeqView$Id.prototype.iterator__sc_Iterator = (function() {
  return this.underlying$4.iterator__sc_Iterator()
});
$c_sc_SeqView$Id.prototype.length__I = (function() {
  return this.underlying$4.length__I()
});
$c_sc_SeqView$Id.prototype.knownSize__I = (function() {
  return this.underlying$4.knownSize__I()
});
var $d_sc_SeqView$Id = new $TypeData().initClass({
  sc_SeqView$Id: 0
}, false, "scala.collection.SeqView$Id", {
  sc_SeqView$Id: 1,
  sc_AbstractSeqView: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_View: 1,
  Ljava_io_Serializable: 1,
  sc_SeqView: 1,
  sc_SeqOps: 1
});
$c_sc_SeqView$Id.prototype.$classData = $d_sc_SeqView$Id;
/** @constructor */
function $c_sc_SeqView$Prepended() {
  $c_sc_View$Prepended.call(this);
  this.elem$4 = null;
  this.underlying$4 = null
}
$c_sc_SeqView$Prepended.prototype = new $h_sc_View$Prepended();
$c_sc_SeqView$Prepended.prototype.constructor = $c_sc_SeqView$Prepended;
/** @constructor */
function $h_sc_SeqView$Prepended() {
  /*<skip>*/
}
$h_sc_SeqView$Prepended.prototype = $c_sc_SeqView$Prepended.prototype;
$c_sc_SeqView$Prepended.prototype.apply__I__O = (function(idx) {
  return ((idx === 0) ? this.elem$4 : this.underlying$4.apply__I__O((((-1) + idx) | 0)))
});
$c_sc_SeqView$Prepended.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqOps__isEmpty__Z(this)
});
$c_sc_SeqView$Prepended.prototype.length__I = (function() {
  return ((1 + this.underlying$4.length__I()) | 0)
});
$c_sc_SeqView$Prepended.prototype.init___O__sc_SeqOps = (function(elem, underlying) {
  this.elem$4 = elem;
  this.underlying$4 = underlying;
  $c_sc_View$Prepended.prototype.init___O__sc_IterableOps.call(this, elem, underlying);
  return this
});
/** @constructor */
function $c_sc_AbstractIndexedSeqView() {
  $c_sc_AbstractSeqView.call(this)
}
$c_sc_AbstractIndexedSeqView.prototype = new $h_sc_AbstractSeqView();
$c_sc_AbstractIndexedSeqView.prototype.constructor = $c_sc_AbstractIndexedSeqView;
/** @constructor */
function $h_sc_AbstractIndexedSeqView() {
  /*<skip>*/
}
$h_sc_AbstractIndexedSeqView.prototype = $c_sc_AbstractIndexedSeqView.prototype;
$c_sc_AbstractIndexedSeqView.prototype.head__O = (function() {
  return this.apply__I__O(0)
});
$c_sc_AbstractIndexedSeqView.prototype.lengthCompare__I__I = (function(len) {
  var x = this.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1))
});
$c_sc_AbstractIndexedSeqView.prototype.drop__I__sc_SeqView = (function(n) {
  return new $c_sc_IndexedSeqView$Drop().init___sc_IndexedSeqOps__I(this, n)
});
$c_sc_AbstractIndexedSeqView.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqView$IndexedSeqViewIterator().init___sc_IndexedSeqView(this)
});
$c_sc_AbstractIndexedSeqView.prototype.drop__I__O = (function(n) {
  return new $c_sc_IndexedSeqView$Drop().init___sc_IndexedSeqOps__I(this, n)
});
$c_sc_AbstractIndexedSeqView.prototype.knownSize__I = (function() {
  return this.length__I()
});
$c_sc_AbstractIndexedSeqView.prototype.stringPrefix__T = (function() {
  return "IndexedSeqView"
});
/** @constructor */
function $c_sc_IndexedSeqView$Drop() {
  $c_sc_SeqView$Drop.call(this)
}
$c_sc_IndexedSeqView$Drop.prototype = new $h_sc_SeqView$Drop();
$c_sc_IndexedSeqView$Drop.prototype.constructor = $c_sc_IndexedSeqView$Drop;
/** @constructor */
function $h_sc_IndexedSeqView$Drop() {
  /*<skip>*/
}
$h_sc_IndexedSeqView$Drop.prototype = $c_sc_IndexedSeqView$Drop.prototype;
$c_sc_IndexedSeqView$Drop.prototype.head__O = (function() {
  return this.apply__I__O(0)
});
$c_sc_IndexedSeqView$Drop.prototype.lengthCompare__I__I = (function(len) {
  var x = this.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1))
});
$c_sc_IndexedSeqView$Drop.prototype.drop__I__sc_SeqView = (function(n) {
  return new $c_sc_IndexedSeqView$Drop().init___sc_IndexedSeqOps__I(this, n)
});
$c_sc_IndexedSeqView$Drop.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqView$IndexedSeqViewIterator().init___sc_IndexedSeqView(this)
});
$c_sc_IndexedSeqView$Drop.prototype.init___sc_IndexedSeqOps__I = (function(underlying, n) {
  $c_sc_SeqView$Drop.prototype.init___sc_SeqOps__I.call(this, underlying, n);
  return this
});
$c_sc_IndexedSeqView$Drop.prototype.drop__I__O = (function(n) {
  return new $c_sc_IndexedSeqView$Drop().init___sc_IndexedSeqOps__I(this, n)
});
$c_sc_IndexedSeqView$Drop.prototype.knownSize__I = (function() {
  return this.length__I()
});
$c_sc_IndexedSeqView$Drop.prototype.stringPrefix__T = (function() {
  return "IndexedSeqView"
});
var $d_sc_IndexedSeqView$Drop = new $TypeData().initClass({
  sc_IndexedSeqView$Drop: 0
}, false, "scala.collection.IndexedSeqView$Drop", {
  sc_IndexedSeqView$Drop: 1,
  sc_SeqView$Drop: 1,
  sc_View$Drop: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_View: 1,
  Ljava_io_Serializable: 1,
  sc_SeqView: 1,
  sc_SeqOps: 1,
  sc_IndexedSeqView: 1,
  sc_IndexedSeqOps: 1
});
$c_sc_IndexedSeqView$Drop.prototype.$classData = $d_sc_IndexedSeqView$Drop;
/** @constructor */
function $c_sc_IndexedSeqView$Id() {
  $c_sc_SeqView$Id.call(this)
}
$c_sc_IndexedSeqView$Id.prototype = new $h_sc_SeqView$Id();
$c_sc_IndexedSeqView$Id.prototype.constructor = $c_sc_IndexedSeqView$Id;
/** @constructor */
function $h_sc_IndexedSeqView$Id() {
  /*<skip>*/
}
$h_sc_IndexedSeqView$Id.prototype = $c_sc_IndexedSeqView$Id.prototype;
$c_sc_IndexedSeqView$Id.prototype.head__O = (function() {
  return this.apply__I__O(0)
});
$c_sc_IndexedSeqView$Id.prototype.lengthCompare__I__I = (function(len) {
  var x = this.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1))
});
$c_sc_IndexedSeqView$Id.prototype.drop__I__sc_SeqView = (function(n) {
  return new $c_sc_IndexedSeqView$Drop().init___sc_IndexedSeqOps__I(this, n)
});
$c_sc_IndexedSeqView$Id.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqView$IndexedSeqViewIterator().init___sc_IndexedSeqView(this)
});
$c_sc_IndexedSeqView$Id.prototype.init___sc_IndexedSeqOps = (function(underlying) {
  $c_sc_SeqView$Id.prototype.init___sc_SeqOps.call(this, underlying);
  return this
});
$c_sc_IndexedSeqView$Id.prototype.drop__I__O = (function(n) {
  return new $c_sc_IndexedSeqView$Drop().init___sc_IndexedSeqOps__I(this, n)
});
$c_sc_IndexedSeqView$Id.prototype.knownSize__I = (function() {
  return this.length__I()
});
$c_sc_IndexedSeqView$Id.prototype.stringPrefix__T = (function() {
  return "IndexedSeqView"
});
var $d_sc_IndexedSeqView$Id = new $TypeData().initClass({
  sc_IndexedSeqView$Id: 0
}, false, "scala.collection.IndexedSeqView$Id", {
  sc_IndexedSeqView$Id: 1,
  sc_SeqView$Id: 1,
  sc_AbstractSeqView: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_View: 1,
  Ljava_io_Serializable: 1,
  sc_SeqView: 1,
  sc_SeqOps: 1,
  sc_IndexedSeqView: 1,
  sc_IndexedSeqOps: 1
});
$c_sc_IndexedSeqView$Id.prototype.$classData = $d_sc_IndexedSeqView$Id;
/** @constructor */
function $c_sc_IndexedSeqView$Prepended() {
  $c_sc_SeqView$Prepended.call(this)
}
$c_sc_IndexedSeqView$Prepended.prototype = new $h_sc_SeqView$Prepended();
$c_sc_IndexedSeqView$Prepended.prototype.constructor = $c_sc_IndexedSeqView$Prepended;
/** @constructor */
function $h_sc_IndexedSeqView$Prepended() {
  /*<skip>*/
}
$h_sc_IndexedSeqView$Prepended.prototype = $c_sc_IndexedSeqView$Prepended.prototype;
$c_sc_IndexedSeqView$Prepended.prototype.head__O = (function() {
  return this.apply__I__O(0)
});
$c_sc_IndexedSeqView$Prepended.prototype.lengthCompare__I__I = (function(len) {
  var x = this.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1))
});
$c_sc_IndexedSeqView$Prepended.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqView$IndexedSeqViewIterator().init___sc_IndexedSeqView(this)
});
$c_sc_IndexedSeqView$Prepended.prototype.init___O__sc_IndexedSeqOps = (function(elem, underlying) {
  $c_sc_SeqView$Prepended.prototype.init___O__sc_SeqOps.call(this, elem, underlying);
  return this
});
$c_sc_IndexedSeqView$Prepended.prototype.drop__I__O = (function(n) {
  return new $c_sc_IndexedSeqView$Drop().init___sc_IndexedSeqOps__I(this, n)
});
$c_sc_IndexedSeqView$Prepended.prototype.knownSize__I = (function() {
  return this.length__I()
});
$c_sc_IndexedSeqView$Prepended.prototype.stringPrefix__T = (function() {
  return "IndexedSeqView"
});
var $d_sc_IndexedSeqView$Prepended = new $TypeData().initClass({
  sc_IndexedSeqView$Prepended: 0
}, false, "scala.collection.IndexedSeqView$Prepended", {
  sc_IndexedSeqView$Prepended: 1,
  sc_SeqView$Prepended: 1,
  sc_View$Prepended: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_View: 1,
  Ljava_io_Serializable: 1,
  sc_SeqView: 1,
  sc_SeqOps: 1,
  sc_IndexedSeqView: 1,
  sc_IndexedSeqOps: 1
});
$c_sc_IndexedSeqView$Prepended.prototype.$classData = $d_sc_IndexedSeqView$Prepended;
/** @constructor */
function $c_sci_AbstractSeq() {
  $c_sc_AbstractSeq.call(this)
}
$c_sci_AbstractSeq.prototype = new $h_sc_AbstractSeq();
$c_sci_AbstractSeq.prototype.constructor = $c_sci_AbstractSeq;
/** @constructor */
function $h_sci_AbstractSeq() {
  /*<skip>*/
}
$h_sci_AbstractSeq.prototype = $c_sci_AbstractSeq.prototype;
function $f_sci_IndexedSeq__sameElements__sc_IterableOnce__Z($thiz, o) {
  if ($is_sci_IndexedSeq(o)) {
    var x2 = $as_sci_IndexedSeq(o);
    if (($thiz === x2)) {
      return true
    } else {
      var length = $thiz.length__I();
      var equal = (length === x2.length__I());
      if (equal) {
        var index = 0;
        var a = $thiz.applyPreferredMaxLength__I();
        var b = x2.applyPreferredMaxLength__I();
        var preferredLength = ((a < b) ? a : b);
        var hi = (length >> 31);
        var hi$1 = (preferredLength >> 31);
        var lo = (preferredLength << 1);
        var hi$2 = (((preferredLength >>> 31) | 0) | (hi$1 << 1));
        if (((hi === hi$2) ? (((-2147483648) ^ length) > ((-2147483648) ^ lo)) : (hi > hi$2))) {
          var maxApplyCompare = preferredLength
        } else {
          var maxApplyCompare = length
        };
        while (((index < maxApplyCompare) && equal)) {
          equal = $m_sr_BoxesRunTime$().equals__O__O__Z($thiz.apply__I__O(index), x2.apply__I__O(index));
          index = ((1 + index) | 0)
        };
        if (((index < length) && equal)) {
          var thisIt = $thiz.iterator__sc_Iterator().drop__I__sc_Iterator(index);
          var thatIt = x2.iterator__sc_Iterator().drop__I__sc_Iterator(index);
          while ((equal && thisIt.hasNext__Z())) {
            equal = $m_sr_BoxesRunTime$().equals__O__O__Z(thisIt.next__O(), thatIt.next__O())
          }
        }
      };
      return equal
    }
  } else {
    return $f_sc_SeqOps__sameElements__sc_IterableOnce__Z($thiz, o)
  }
}
function $f_sci_IndexedSeq__canEqual__O__Z($thiz, that) {
  if ((!$is_sci_IndexedSeq(that))) {
    return true
  } else {
    var x2 = $as_sci_IndexedSeq(that);
    return ($thiz.length__I() === x2.length__I())
  }
}
function $is_sci_IndexedSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_IndexedSeq)))
}
function $as_sci_IndexedSeq(obj) {
  return (($is_sci_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.IndexedSeq"))
}
function $isArrayOf_sci_IndexedSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_IndexedSeq)))
}
function $asArrayOf_sci_IndexedSeq(obj, depth) {
  return (($isArrayOf_sci_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.IndexedSeq;", depth))
}
/** @constructor */
function $c_scm_ArrayBufferView() {
  $c_sc_AbstractIndexedSeqView.call(this);
  this.array$5 = null;
  this.length$5 = 0
}
$c_scm_ArrayBufferView.prototype = new $h_sc_AbstractIndexedSeqView();
$c_scm_ArrayBufferView.prototype.constructor = $c_scm_ArrayBufferView;
/** @constructor */
function $h_scm_ArrayBufferView() {
  /*<skip>*/
}
$h_scm_ArrayBufferView.prototype = $c_scm_ArrayBufferView.prototype;
$c_scm_ArrayBufferView.prototype.apply__I__O = (function(n) {
  if ((n < this.length$5)) {
    return this.array$5.get(n)
  } else {
    throw new $c_jl_IndexOutOfBoundsException().init___T((((n + " is out of bounds (min 0, max ") + (((-1) + this.length$5) | 0)) + ")"))
  }
});
$c_scm_ArrayBufferView.prototype.length__I = (function() {
  return this.length$5
});
$c_scm_ArrayBufferView.prototype.className__T = (function() {
  return "ArrayBufferView"
});
$c_scm_ArrayBufferView.prototype.init___AO__I = (function(array, length) {
  this.array$5 = array;
  this.length$5 = length;
  return this
});
var $d_scm_ArrayBufferView = new $TypeData().initClass({
  scm_ArrayBufferView: 0
}, false, "scala.collection.mutable.ArrayBufferView", {
  scm_ArrayBufferView: 1,
  sc_AbstractIndexedSeqView: 1,
  sc_AbstractSeqView: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_View: 1,
  Ljava_io_Serializable: 1,
  sc_SeqView: 1,
  sc_SeqOps: 1,
  sc_IndexedSeqView: 1,
  sc_IndexedSeqOps: 1
});
$c_scm_ArrayBufferView.prototype.$classData = $d_scm_ArrayBufferView;
/** @constructor */
function $c_sc_StringView() {
  $c_sc_AbstractIndexedSeqView.call(this);
  this.s$5 = null
}
$c_sc_StringView.prototype = new $h_sc_AbstractIndexedSeqView();
$c_sc_StringView.prototype.constructor = $c_sc_StringView;
/** @constructor */
function $h_sc_StringView() {
  /*<skip>*/
}
$h_sc_StringView.prototype = $c_sc_StringView.prototype;
$c_sc_StringView.prototype.productPrefix__T = (function() {
  return "StringView"
});
$c_sc_StringView.prototype.apply__I__O = (function(i) {
  var thiz = this.s$5;
  var c = (65535 & $uI(thiz.charCodeAt(i)));
  return new $c_jl_Character().init___C(c)
});
$c_sc_StringView.prototype.productArity__I = (function() {
  return 1
});
$c_sc_StringView.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ((x$1 instanceof $c_sc_StringView)) {
    var StringView$1 = $as_sc_StringView(x$1);
    return (this.s$5 === StringView$1.s$5)
  } else {
    return false
  }
});
$c_sc_StringView.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.s$5;
      break
    }
    default: {
      return $m_sr_Statics$().ioobe__I__O(x$1)
    }
  }
});
$c_sc_StringView.prototype.toString__T = (function() {
  return (("StringView(" + this.s$5) + ")")
});
$c_sc_StringView.prototype.length__I = (function() {
  var thiz = this.s$5;
  return $uI(thiz.length)
});
$c_sc_StringView.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__Z__I(this, (-889275714), false)
});
$c_sc_StringView.prototype.init___T = (function(s) {
  this.s$5 = s;
  return this
});
$c_sc_StringView.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $as_sc_StringView(obj) {
  return (((obj instanceof $c_sc_StringView) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.StringView"))
}
function $isArrayOf_sc_StringView(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_StringView)))
}
function $asArrayOf_sc_StringView(obj, depth) {
  return (($isArrayOf_sc_StringView(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.StringView;", depth))
}
var $d_sc_StringView = new $TypeData().initClass({
  sc_StringView: 0
}, false, "scala.collection.StringView", {
  sc_StringView: 1,
  sc_AbstractIndexedSeqView: 1,
  sc_AbstractSeqView: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_View: 1,
  Ljava_io_Serializable: 1,
  sc_SeqView: 1,
  sc_SeqOps: 1,
  sc_IndexedSeqView: 1,
  sc_IndexedSeqOps: 1,
  s_Product: 1,
  s_Equals: 1
});
$c_sc_StringView.prototype.$classData = $d_sc_StringView;
/** @constructor */
function $c_scm_AbstractSeq() {
  $c_sc_AbstractSeq.call(this)
}
$c_scm_AbstractSeq.prototype = new $h_sc_AbstractSeq();
$c_scm_AbstractSeq.prototype.constructor = $c_scm_AbstractSeq;
/** @constructor */
function $h_scm_AbstractSeq() {
  /*<skip>*/
}
$h_scm_AbstractSeq.prototype = $c_scm_AbstractSeq.prototype;
/** @constructor */
function $c_sci_LazyList() {
  $c_sci_AbstractSeq.call(this);
  this.scala$collection$immutable$LazyList$$state$4 = null;
  this.lazyState$4 = null;
  this.scala$collection$immutable$LazyList$$stateEvaluated$f = false;
  this.midEvaluation$4 = false;
  this.bitmap$0$4 = false
}
$c_sci_LazyList.prototype = new $h_sci_AbstractSeq();
$c_sci_LazyList.prototype.constructor = $c_sci_LazyList;
/** @constructor */
function $h_sci_LazyList() {
  /*<skip>*/
}
$h_sci_LazyList.prototype = $c_sci_LazyList.prototype;
$c_sci_LazyList.prototype.init___F0 = (function(lazyState) {
  this.lazyState$4 = lazyState;
  this.scala$collection$immutable$LazyList$$stateEvaluated$f = false;
  this.midEvaluation$4 = false;
  return this
});
$c_sci_LazyList.prototype.head__O = (function() {
  return this.scala$collection$immutable$LazyList$$state__sci_LazyList$State().head__O()
});
$c_sci_LazyList.prototype.apply__I__O = (function(n) {
  return $f_sc_LinearSeqOps__apply__I__O(this, n)
});
$c_sci_LazyList.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_LinearSeqOps__lengthCompare__I__I(this, len)
});
$c_sci_LazyList.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOps__apply__I__O(this, n)
});
$c_sci_LazyList.prototype.isEmpty__Z = (function() {
  return (this.scala$collection$immutable$LazyList$$state__sci_LazyList$State() === $m_sci_LazyList$State$Empty$())
});
$c_sci_LazyList.prototype.sameElements__sc_IterableOnce__Z = (function(that) {
  return $f_sc_LinearSeqOps__sameElements__sc_IterableOnce__Z(this, that)
});
$c_sci_LazyList.prototype.equals__O__Z = (function(that) {
  return ((this === that) || $f_sc_Seq__equals__O__Z(this, that))
});
$c_sci_LazyList.prototype.toString__T = (function() {
  return this.addStringNoForce__p4__jl_StringBuilder__T__T__T__jl_StringBuilder(new $c_jl_StringBuilder().init___T("LazyList"), "(", ", ", ")").java$lang$StringBuilder$$content$f
});
$c_sci_LazyList.prototype.foreach__F1__V = (function(f) {
  var _$this = this;
  _foreach: while (true) {
    if ((!_$this.isEmpty__Z())) {
      var this$1 = _$this;
      f.apply__O__O(this$1.scala$collection$immutable$LazyList$$state__sci_LazyList$State().head__O());
      var this$2 = _$this;
      _$this = this$2.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList();
      continue _foreach
    };
    break
  }
});
$c_sci_LazyList.prototype.prepended__O__sci_LazyList = (function(elem) {
  $m_sci_LazyList$();
  var state = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, elem$1) {
    return (function() {
      $m_sci_LazyList$();
      return new $c_sci_LazyList$State$Cons().init___O__sci_LazyList(elem$1, $this)
    })
  })(this, elem));
  return new $c_sci_LazyList().init___F0(state)
});
$c_sci_LazyList.prototype.prepended__O__O = (function(elem) {
  return this.prepended__O__sci_LazyList(elem)
});
$c_sci_LazyList.prototype.iterator__sc_Iterator = (function() {
  return ((this.scala$collection$immutable$LazyList$$stateEvaluated$f && this.isEmpty__Z()) ? $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f : new $c_sci_LazyList$LazyIterator().init___sci_LazyList(this))
});
$c_sci_LazyList.prototype.length__I = (function() {
  return $f_sc_LinearSeqOps__length__I(this)
});
$c_sci_LazyList.prototype.prependedAll__sc_IterableOnce__O = (function(prefix) {
  return this.prependedAll__sc_IterableOnce__sci_LazyList(prefix)
});
$c_sci_LazyList.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_sci_LazyList$()
});
$c_sci_LazyList.prototype.scala$collection$immutable$LazyList$$state__sci_LazyList$State = (function() {
  return ((!this.bitmap$0$4) ? this.scala$collection$immutable$LazyList$$state$lzycompute__p4__sci_LazyList$State() : this.scala$collection$immutable$LazyList$$state$4)
});
$c_sci_LazyList.prototype.drop__I__O = (function(n) {
  return this.drop__I__sci_LazyList(n)
});
$c_sci_LazyList.prototype.tail__O = (function() {
  return this.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList()
});
$c_sci_LazyList.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(sb, start, sep, end) {
  this.force__sci_LazyList();
  this.addStringNoForce__p4__jl_StringBuilder__T__T__T__jl_StringBuilder(sb.underlying$4, start, sep, end);
  return sb
});
$c_sci_LazyList.prototype.addStringNoForce__p4__jl_StringBuilder__T__T__T__jl_StringBuilder = (function(b, start, sep, end) {
  b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + start);
  if ((!this.scala$collection$immutable$LazyList$$stateEvaluated$f)) {
    b.java$lang$StringBuilder$$content$f = (b.java$lang$StringBuilder$$content$f + "<not computed>")
  } else if ((!this.isEmpty__Z())) {
    var obj = this.scala$collection$immutable$LazyList$$state__sci_LazyList$State().head__O();
    b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + obj);
    var elem$1 = null;
    elem$1 = this;
    var elem = this.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList();
    var elem$1$1 = null;
    elem$1$1 = elem;
    if ((($as_sci_LazyList(elem$1) !== $as_sci_LazyList(elem$1$1)) && ((!$as_sci_LazyList(elem$1$1).scala$collection$immutable$LazyList$$stateEvaluated$f) || ($as_sci_LazyList(elem$1).scala$collection$immutable$LazyList$$state__sci_LazyList$State() !== $as_sci_LazyList(elem$1$1).scala$collection$immutable$LazyList$$state__sci_LazyList$State())))) {
      elem$1 = $as_sci_LazyList(elem$1$1);
      if (($as_sci_LazyList(elem$1$1).scala$collection$immutable$LazyList$$stateEvaluated$f && (!$as_sci_LazyList(elem$1$1).isEmpty__Z()))) {
        var this$3 = $as_sci_LazyList(elem$1$1);
        elem$1$1 = this$3.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList();
        while (((($as_sci_LazyList(elem$1) !== $as_sci_LazyList(elem$1$1)) && ($as_sci_LazyList(elem$1$1).scala$collection$immutable$LazyList$$stateEvaluated$f && (!$as_sci_LazyList(elem$1$1).isEmpty__Z()))) && ($as_sci_LazyList(elem$1).scala$collection$immutable$LazyList$$state__sci_LazyList$State() !== $as_sci_LazyList(elem$1$1).scala$collection$immutable$LazyList$$state__sci_LazyList$State()))) {
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
          var this$4 = $as_sci_LazyList(elem$1);
          var obj$1 = this$4.scala$collection$immutable$LazyList$$state__sci_LazyList$State().head__O();
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + obj$1);
          var this$5 = $as_sci_LazyList(elem$1);
          elem$1 = this$5.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList();
          var this$6 = $as_sci_LazyList(elem$1$1);
          elem$1$1 = this$6.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList();
          if (($as_sci_LazyList(elem$1$1).scala$collection$immutable$LazyList$$stateEvaluated$f && (!$as_sci_LazyList(elem$1$1).isEmpty__Z()))) {
            var this$7 = $as_sci_LazyList(elem$1$1);
            elem$1$1 = this$7.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList()
          }
        }
      }
    };
    if ((!($as_sci_LazyList(elem$1$1).scala$collection$immutable$LazyList$$stateEvaluated$f && (!$as_sci_LazyList(elem$1$1).isEmpty__Z())))) {
      while (($as_sci_LazyList(elem$1) !== $as_sci_LazyList(elem$1$1))) {
        b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
        var this$8 = $as_sci_LazyList(elem$1);
        var obj$2 = this$8.scala$collection$immutable$LazyList$$state__sci_LazyList$State().head__O();
        b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + obj$2);
        var this$9 = $as_sci_LazyList(elem$1);
        elem$1 = this$9.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList()
      };
      if ((!$as_sci_LazyList(elem$1).scala$collection$immutable$LazyList$$stateEvaluated$f)) {
        b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
        b.java$lang$StringBuilder$$content$f = (b.java$lang$StringBuilder$$content$f + "<not computed>")
      }
    } else {
      var runner = this;
      var k = 0;
      while (true) {
        var a = runner;
        var b$1 = $as_sci_LazyList(elem$1$1);
        if ((!((a === b$1) || (a.scala$collection$immutable$LazyList$$state__sci_LazyList$State() === b$1.scala$collection$immutable$LazyList$$state__sci_LazyList$State())))) {
          var this$10 = runner;
          runner = this$10.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList();
          var this$11 = $as_sci_LazyList(elem$1$1);
          elem$1$1 = this$11.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList();
          k = ((1 + k) | 0)
        } else {
          break
        }
      };
      var a$1 = $as_sci_LazyList(elem$1);
      var b$2 = $as_sci_LazyList(elem$1$1);
      if ((((a$1 === b$2) || (a$1.scala$collection$immutable$LazyList$$state__sci_LazyList$State() === b$2.scala$collection$immutable$LazyList$$state__sci_LazyList$State())) && (k > 0))) {
        b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
        var this$12 = $as_sci_LazyList(elem$1);
        var obj$3 = this$12.scala$collection$immutable$LazyList$$state__sci_LazyList$State().head__O();
        b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + obj$3);
        var this$13 = $as_sci_LazyList(elem$1);
        elem$1 = this$13.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList()
      };
      while (true) {
        var a$2 = $as_sci_LazyList(elem$1);
        var b$3 = $as_sci_LazyList(elem$1$1);
        if ((!((a$2 === b$3) || (a$2.scala$collection$immutable$LazyList$$state__sci_LazyList$State() === b$3.scala$collection$immutable$LazyList$$state__sci_LazyList$State())))) {
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
          var this$14 = $as_sci_LazyList(elem$1);
          var obj$4 = this$14.scala$collection$immutable$LazyList$$state__sci_LazyList$State().head__O();
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + obj$4);
          var this$15 = $as_sci_LazyList(elem$1);
          elem$1 = this$15.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList()
        } else {
          break
        }
      };
      b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
      b.java$lang$StringBuilder$$content$f = (b.java$lang$StringBuilder$$content$f + "<cycle>")
    }
  };
  b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + end);
  return b
});
$c_sci_LazyList.prototype.prependedAll__sc_IterableOnce__sci_LazyList = (function(prefix) {
  if ((this.scala$collection$immutable$LazyList$$stateEvaluated$f && this.isEmpty__Z())) {
    return $m_sci_LazyList$().from__sc_IterableOnce__sci_LazyList(prefix)
  } else if ((prefix.knownSize__I() === 0)) {
    return this
  } else {
    $m_sci_LazyList$();
    var state = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, prefix$1) {
      return (function() {
        return $m_sci_LazyList$().scala$collection$immutable$LazyList$$stateFromIteratorConcatSuffix__sc_Iterator__F0__sci_LazyList$State(prefix$1.iterator__sc_Iterator(), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$1) {
          return (function() {
            return $this$1.scala$collection$immutable$LazyList$$state__sci_LazyList$State()
          })
        })($this)))
      })
    })(this, prefix));
    return new $c_sci_LazyList().init___F0(state)
  }
});
$c_sci_LazyList.prototype.force__sci_LazyList = (function() {
  var these = this;
  var those = this;
  if ((!these.isEmpty__Z())) {
    var this$1 = these;
    these = this$1.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList()
  };
  while ((those !== these)) {
    if (these.isEmpty__Z()) {
      return this
    };
    var this$2 = these;
    these = this$2.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList();
    if (these.isEmpty__Z()) {
      return this
    };
    var this$3 = these;
    these = this$3.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList();
    if ((these === those)) {
      return this
    };
    var this$4 = those;
    those = this$4.scala$collection$immutable$LazyList$$state__sci_LazyList$State().tail__sci_LazyList()
  };
  return this
});
$c_sci_LazyList.prototype.className__T = (function() {
  return "LazyList"
});
$c_sci_LazyList.prototype.drop__I__sci_LazyList = (function(n) {
  return ((n <= 0) ? this : ((this.scala$collection$immutable$LazyList$$stateEvaluated$f && this.isEmpty__Z()) ? $m_sci_LazyList$().$$undempty$1 : $m_sci_LazyList$().scala$collection$immutable$LazyList$$dropImpl__sci_LazyList__I__sci_LazyList(this, n)))
});
$c_sci_LazyList.prototype.knownSize__I = (function() {
  return ((this.scala$collection$immutable$LazyList$$stateEvaluated$f && this.isEmpty__Z()) ? 0 : (-1))
});
$c_sci_LazyList.prototype.scala$collection$immutable$LazyList$$state$lzycompute__p4__sci_LazyList$State = (function() {
  if ((!this.bitmap$0$4)) {
    if (this.midEvaluation$4) {
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new $c_jl_RuntimeException().init___T("self-referential LazyList or a derivation thereof has no more elements"))
    };
    this.midEvaluation$4 = true;
    try {
      var res = $as_sci_LazyList$State(this.lazyState$4.apply__O())
    } finally {
      this.midEvaluation$4 = false
    };
    this.scala$collection$immutable$LazyList$$stateEvaluated$f = true;
    this.lazyState$4 = null;
    this.scala$collection$immutable$LazyList$$state$4 = res;
    this.bitmap$0$4 = true
  };
  return this.scala$collection$immutable$LazyList$$state$4
});
$c_sci_LazyList.prototype.stringPrefix__T = (function() {
  return "LinearSeq"
});
function $as_sci_LazyList(obj) {
  return (((obj instanceof $c_sci_LazyList) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.LazyList"))
}
function $isArrayOf_sci_LazyList(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_LazyList)))
}
function $asArrayOf_sci_LazyList(obj, depth) {
  return (($isArrayOf_sci_LazyList(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.LazyList;", depth))
}
var $d_sci_LazyList = new $TypeData().initClass({
  sci_LazyList: 0
}, false, "scala.collection.immutable.LazyList", {
  sci_LazyList: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_LinearSeq: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqOps: 1,
  sci_LinearSeqOps: 1,
  Ljava_io_Serializable: 1
});
$c_sci_LazyList.prototype.$classData = $d_sci_LazyList;
/** @constructor */
function $c_sci_Stream() {
  $c_sci_AbstractSeq.call(this)
}
$c_sci_Stream.prototype = new $h_sci_AbstractSeq();
$c_sci_Stream.prototype.constructor = $c_sci_Stream;
/** @constructor */
function $h_sci_Stream() {
  /*<skip>*/
}
$h_sci_Stream.prototype = $c_sci_Stream.prototype;
$c_sci_Stream.prototype.prepended__O__sci_Stream = (function(elem) {
  var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this
    })
  })(this));
  return new $c_sci_Stream$Cons().init___O__F0(elem, tl)
});
$c_sci_Stream.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_LinearSeqOps__lengthCompare__I__I(this, len)
});
$c_sci_Stream.prototype.apply__I__O = (function(n) {
  return $f_sc_LinearSeqOps__apply__I__O(this, n)
});
$c_sci_Stream.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOps__apply__I__O(this, n)
});
$c_sci_Stream.prototype.sameElements__sc_IterableOnce__Z = (function(that) {
  return $f_sc_LinearSeqOps__sameElements__sc_IterableOnce__Z(this, that)
});
$c_sci_Stream.prototype.equals__O__Z = (function(that) {
  return ((this === that) || $f_sc_Seq__equals__O__Z(this, that))
});
$c_sci_Stream.prototype.toString__T = (function() {
  return this.addStringNoForce__p4__jl_StringBuilder__T__T__T__jl_StringBuilder(new $c_jl_StringBuilder().init___T("Stream"), "(", ", ", ")").java$lang$StringBuilder$$content$f
});
$c_sci_Stream.prototype.foreach__F1__V = (function(f) {
  var _$this = this;
  _foreach: while (true) {
    if ((!_$this.isEmpty__Z())) {
      f.apply__O__O(_$this.head__O());
      _$this = $as_sci_Stream(_$this.tail__O());
      continue _foreach
    };
    break
  }
});
$c_sci_Stream.prototype.prepended__O__O = (function(elem) {
  return this.prepended__O__sci_Stream(elem)
});
$c_sci_Stream.prototype.iterator__sc_Iterator = (function() {
  return $f_sc_LinearSeqOps__iterator__sc_Iterator(this)
});
$c_sci_Stream.prototype.length__I = (function() {
  return $f_sc_LinearSeqOps__length__I(this)
});
$c_sci_Stream.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_sci_Stream$()
});
$c_sci_Stream.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(sb, start, sep, end) {
  this.force__sci_Stream();
  this.addStringNoForce__p4__jl_StringBuilder__T__T__T__jl_StringBuilder(sb.underlying$4, start, sep, end);
  return sb
});
$c_sci_Stream.prototype.addStringNoForce__p4__jl_StringBuilder__T__T__T__jl_StringBuilder = (function(b, start, sep, end) {
  b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + start);
  if ($f_sc_IterableOnceOps__nonEmpty__Z(this)) {
    var obj = this.head__O();
    b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + obj);
    var elem$1 = null;
    elem$1 = this;
    if (this.tailDefined__Z()) {
      var scout = $as_sci_Stream(this.tail__O());
      if (($as_sci_Stream(elem$1) !== scout)) {
        elem$1 = scout;
        if (scout.tailDefined__Z()) {
          scout = $as_sci_Stream(scout.tail__O());
          while ((($as_sci_Stream(elem$1) !== scout) && scout.tailDefined__Z())) {
            b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
            var obj$1 = $as_sci_Stream(elem$1).head__O();
            b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + obj$1);
            elem$1 = $as_sci_Stream($as_sci_Stream(elem$1).tail__O());
            scout = $as_sci_Stream(scout.tail__O());
            if (scout.tailDefined__Z()) {
              scout = $as_sci_Stream(scout.tail__O())
            }
          }
        }
      };
      if ((!scout.tailDefined__Z())) {
        while (($as_sci_Stream(elem$1) !== scout)) {
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
          var obj$2 = $as_sci_Stream(elem$1).head__O();
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + obj$2);
          elem$1 = $as_sci_Stream($as_sci_Stream(elem$1).tail__O())
        };
        var this$2 = $as_sci_Stream(elem$1);
        if ($f_sc_IterableOnceOps__nonEmpty__Z(this$2)) {
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
          var obj$3 = $as_sci_Stream(elem$1).head__O();
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + obj$3)
        }
      } else {
        var runner = this;
        var k = 0;
        while ((runner !== scout)) {
          runner = $as_sci_Stream(runner.tail__O());
          scout = $as_sci_Stream(scout.tail__O());
          k = ((1 + k) | 0)
        };
        if ((($as_sci_Stream(elem$1) === scout) && (k > 0))) {
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
          var obj$4 = $as_sci_Stream(elem$1).head__O();
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + obj$4);
          elem$1 = $as_sci_Stream($as_sci_Stream(elem$1).tail__O())
        };
        while (($as_sci_Stream(elem$1) !== scout)) {
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
          var obj$5 = $as_sci_Stream(elem$1).head__O();
          b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + obj$5);
          elem$1 = $as_sci_Stream($as_sci_Stream(elem$1).tail__O())
        }
      }
    };
    var this$3 = $as_sci_Stream(elem$1);
    if ($f_sc_IterableOnceOps__nonEmpty__Z(this$3)) {
      if ((!$as_sci_Stream(elem$1).tailDefined__Z())) {
        b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
        b.java$lang$StringBuilder$$content$f = (b.java$lang$StringBuilder$$content$f + "<not computed>")
      } else {
        b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + sep);
        b.java$lang$StringBuilder$$content$f = (b.java$lang$StringBuilder$$content$f + "<cycle>")
      }
    }
  };
  b.java$lang$StringBuilder$$content$f = (("" + b.java$lang$StringBuilder$$content$f) + end);
  return b
});
$c_sci_Stream.prototype.className__T = (function() {
  return "Stream"
});
$c_sci_Stream.prototype.stringPrefix__T = (function() {
  return "LinearSeq"
});
function $as_sci_Stream(obj) {
  return (((obj instanceof $c_sci_Stream) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream"))
}
function $isArrayOf_sci_Stream(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream)))
}
function $asArrayOf_sci_Stream(obj, depth) {
  return (($isArrayOf_sci_Stream(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream;", depth))
}
/** @constructor */
function $c_sci_WrappedString() {
  $c_sci_AbstractSeq.call(this);
  this.scala$collection$immutable$WrappedString$$self$4 = null
}
$c_sci_WrappedString.prototype = new $h_sci_AbstractSeq();
$c_sci_WrappedString.prototype.constructor = $c_sci_WrappedString;
/** @constructor */
function $h_sci_WrappedString() {
  /*<skip>*/
}
$h_sci_WrappedString.prototype = $c_sci_WrappedString.prototype;
$c_sci_WrappedString.prototype.head__O = (function() {
  var thiz = this.scala$collection$immutable$WrappedString$$self$4;
  var c = (65535 & $uI(thiz.charCodeAt(0)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_WrappedString.prototype.apply__I__O = (function(i) {
  var thiz = this.scala$collection$immutable$WrappedString$$self$4;
  var c = (65535 & $uI(thiz.charCodeAt(i)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_WrappedString.prototype.lengthCompare__I__I = (function(len) {
  var thiz = this.scala$collection$immutable$WrappedString$$self$4;
  var x = $uI(thiz.length);
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1))
});
$c_sci_WrappedString.prototype.apply__O__O = (function(v1) {
  var i = $uI(v1);
  var thiz = this.scala$collection$immutable$WrappedString$$self$4;
  var c = (65535 & $uI(thiz.charCodeAt(i)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_WrappedString.prototype.copyToArray__O__I__I__I = (function(xs, start, len) {
  if ($isArrayOf_C(xs, 1)) {
    var x2 = $asArrayOf_C(xs, 1);
    var thiz = this.scala$collection$immutable$WrappedString$$self$4;
    var srcLen = $uI(thiz.length);
    var destLen = x2.u.length;
    var x = ((len < srcLen) ? len : srcLen);
    var y = ((destLen - start) | 0);
    var x$1 = ((x < y) ? x : y);
    var copied = ((x$1 > 0) ? x$1 : 0);
    $m_sjsr_RuntimeString$().getChars__T__I__I__AC__I__V(this.scala$collection$immutable$WrappedString$$self$4, 0, copied, x2, start);
    return copied
  } else {
    return $f_sc_IterableOnceOps__copyToArray__O__I__I__I(this, xs, start, len)
  }
});
$c_sci_WrappedString.prototype.applyPreferredMaxLength__I = (function() {
  return 2147483647
});
$c_sci_WrappedString.prototype.sameElements__sc_IterableOnce__Z = (function(o) {
  if ((o instanceof $c_sci_WrappedString)) {
    var x2 = $as_sci_WrappedString(o);
    return (this.scala$collection$immutable$WrappedString$$self$4 === x2.scala$collection$immutable$WrappedString$$self$4)
  } else {
    return $f_sci_IndexedSeq__sameElements__sc_IterableOnce__Z(this, o)
  }
});
$c_sci_WrappedString.prototype.equals__O__Z = (function(other) {
  if ((other instanceof $c_sci_WrappedString)) {
    var x2 = $as_sci_WrappedString(other);
    return (this.scala$collection$immutable$WrappedString$$self$4 === x2.scala$collection$immutable$WrappedString$$self$4)
  } else {
    return $f_sc_Seq__equals__O__Z(this, other)
  }
});
$c_sci_WrappedString.prototype.fromSpecific__sc_IterableOnce__O = (function(coll) {
  return $m_sci_WrappedString$().fromSpecific__sc_IterableOnce__sci_WrappedString(coll)
});
$c_sci_WrappedString.prototype.toString__T = (function() {
  return this.scala$collection$immutable$WrappedString$$self$4
});
$c_sci_WrappedString.prototype.copyToArray__O__I__I = (function(xs, start) {
  var thiz = this.scala$collection$immutable$WrappedString$$self$4;
  return this.copyToArray__O__I__I__I(xs, start, $uI(thiz.length))
});
$c_sci_WrappedString.prototype.prepended__O__O = (function(elem) {
  return $f_sc_IndexedSeqOps__prepended__O__O(this, elem)
});
$c_sci_WrappedString.prototype.canEqual__O__Z = (function(that) {
  return $f_sci_IndexedSeq__canEqual__O__Z(this, that)
});
$c_sci_WrappedString.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new $c_sc_StringView().init___T(this.scala$collection$immutable$WrappedString$$self$4);
  return new $c_sc_IndexedSeqView$IndexedSeqViewIterator().init___sc_IndexedSeqView(this$1)
});
$c_sci_WrappedString.prototype.length__I = (function() {
  var thiz = this.scala$collection$immutable$WrappedString$$self$4;
  return $uI(thiz.length)
});
$c_sci_WrappedString.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_sci_IndexedSeq$()
});
$c_sci_WrappedString.prototype.drop__I__O = (function(n) {
  return $f_sc_IndexedSeqOps__drop__I__O(this, n)
});
$c_sci_WrappedString.prototype.init___T = (function(self) {
  this.scala$collection$immutable$WrappedString$$self$4 = self;
  return this
});
$c_sci_WrappedString.prototype.className__T = (function() {
  return "WrappedString"
});
$c_sci_WrappedString.prototype.knownSize__I = (function() {
  var thiz = this.scala$collection$immutable$WrappedString$$self$4;
  return $uI(thiz.length)
});
$c_sci_WrappedString.prototype.fromSpecific__sc_IterableOnce__sc_IterableOps = (function(coll) {
  return $m_sci_WrappedString$().fromSpecific__sc_IterableOnce__sci_WrappedString(coll)
});
$c_sci_WrappedString.prototype.stringPrefix__T = (function() {
  return "IndexedSeq"
});
function $as_sci_WrappedString(obj) {
  return (((obj instanceof $c_sci_WrappedString) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.WrappedString"))
}
function $isArrayOf_sci_WrappedString(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_WrappedString)))
}
function $asArrayOf_sci_WrappedString(obj, depth) {
  return (($isArrayOf_sci_WrappedString(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.WrappedString;", depth))
}
var $d_sci_WrappedString = new $TypeData().initClass({
  sci_WrappedString: 0
}, false, "scala.collection.immutable.WrappedString", {
  sci_WrappedString: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  sci_IndexedSeqOps: 1,
  Ljava_io_Serializable: 1
});
$c_sci_WrappedString.prototype.$classData = $d_sci_WrappedString;
/** @constructor */
function $c_sjsr_WrappedVarArgs() {
  $c_O.call(this);
  this.array$1 = null
}
$c_sjsr_WrappedVarArgs.prototype = new $h_O();
$c_sjsr_WrappedVarArgs.prototype.constructor = $c_sjsr_WrappedVarArgs;
/** @constructor */
function $h_sjsr_WrappedVarArgs() {
  /*<skip>*/
}
$h_sjsr_WrappedVarArgs.prototype = $c_sjsr_WrappedVarArgs.prototype;
$c_sjsr_WrappedVarArgs.prototype.compose__F1__F1 = (function(g) {
  return $f_F1__compose__F1__F1(this, g)
});
$c_sjsr_WrappedVarArgs.prototype.head__O = (function() {
  return this.apply__I__O(0)
});
$c_sjsr_WrappedVarArgs.prototype.apply__I__O = (function(idx) {
  return this.array$1[idx]
});
$c_sjsr_WrappedVarArgs.prototype.lengthCompare__I__I = (function(len) {
  var x = this.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1))
});
$c_sjsr_WrappedVarArgs.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_sjsr_WrappedVarArgs.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqOps__isEmpty__Z(this)
});
$c_sjsr_WrappedVarArgs.prototype.applyPreferredMaxLength__I = (function() {
  return $m_sci_IndexedSeqDefaults$().defaultApplyPreferredMaxLength$1
});
$c_sjsr_WrappedVarArgs.prototype.sameElements__sc_IterableOnce__Z = (function(o) {
  return $f_sci_IndexedSeq__sameElements__sc_IterableOnce__Z(this, o)
});
$c_sjsr_WrappedVarArgs.prototype.equals__O__Z = (function(o) {
  return $f_sc_Seq__equals__O__Z(this, o)
});
$c_sjsr_WrappedVarArgs.prototype.fromSpecific__sc_IterableOnce__O = (function(coll) {
  var this$1 = $m_sjsr_WrappedVarArgs$();
  return this$1.from__sc_IterableOnce__sjsr_WrappedVarArgs(coll)
});
$c_sjsr_WrappedVarArgs.prototype.toString__T = (function() {
  return $f_sc_Iterable__toString__T(this)
});
$c_sjsr_WrappedVarArgs.prototype.foreach__F1__V = (function(f) {
  $f_sc_IterableOnceOps__foreach__F1__V(this, f)
});
$c_sjsr_WrappedVarArgs.prototype.copyToArray__O__I__I = (function(xs, start) {
  return $f_sc_IterableOnceOps__copyToArray__O__I__I(this, xs, start)
});
$c_sjsr_WrappedVarArgs.prototype.prepended__O__O = (function(elem) {
  return $f_sc_StrictOptimizedSeqOps__prepended__O__O(this, elem)
});
$c_sjsr_WrappedVarArgs.prototype.canEqual__O__Z = (function(that) {
  return $f_sci_IndexedSeq__canEqual__O__Z(this, that)
});
$c_sjsr_WrappedVarArgs.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new $c_sc_IndexedSeqView$Id().init___sc_IndexedSeqOps(this);
  return new $c_sc_IndexedSeqView$IndexedSeqViewIterator().init___sc_IndexedSeqView(this$1)
});
$c_sjsr_WrappedVarArgs.prototype.length__I = (function() {
  return $uI(this.array$1.length)
});
$c_sjsr_WrappedVarArgs.prototype.prependedAll__sc_IterableOnce__O = (function(prefix) {
  return $f_sc_StrictOptimizedSeqOps__prependedAll__sc_IterableOnce__O(this, prefix)
});
$c_sjsr_WrappedVarArgs.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_sjsr_WrappedVarArgs$()
});
$c_sjsr_WrappedVarArgs.prototype.drop__I__O = (function(n) {
  return $f_sc_IndexedSeqOps__drop__I__O(this, n)
});
$c_sjsr_WrappedVarArgs.prototype.tail__O = (function() {
  return $f_sc_IterableOps__tail__O(this)
});
$c_sjsr_WrappedVarArgs.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sjsr_WrappedVarArgs.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sjsr_WrappedVarArgs.prototype.className__T = (function() {
  return "WrappedVarArgs"
});
$c_sjsr_WrappedVarArgs.prototype.init___sjs_js_Array = (function(array) {
  this.array$1 = array;
  return this
});
$c_sjsr_WrappedVarArgs.prototype.knownSize__I = (function() {
  return this.length__I()
});
$c_sjsr_WrappedVarArgs.prototype.iterableFactory__sc_SeqFactory = (function() {
  return $m_sjsr_WrappedVarArgs$()
});
function $as_sjsr_WrappedVarArgs(obj) {
  return (((obj instanceof $c_sjsr_WrappedVarArgs) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.runtime.WrappedVarArgs"))
}
function $isArrayOf_sjsr_WrappedVarArgs(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_WrappedVarArgs)))
}
function $asArrayOf_sjsr_WrappedVarArgs(obj, depth) {
  return (($isArrayOf_sjsr_WrappedVarArgs(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.runtime.WrappedVarArgs;", depth))
}
var $d_sjsr_WrappedVarArgs = new $TypeData().initClass({
  sjsr_WrappedVarArgs: 0
}, false, "scala.scalajs.runtime.WrappedVarArgs", {
  sjsr_WrappedVarArgs: 1,
  O: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_SeqOps: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  sci_IndexedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_WrappedVarArgs.prototype.$classData = $d_sjsr_WrappedVarArgs;
/** @constructor */
function $c_sci_Stream$Cons() {
  $c_sci_Stream.call(this);
  this.head$5 = null;
  this.tlVal$5 = null;
  this.tlGen$5 = null
}
$c_sci_Stream$Cons.prototype = new $h_sci_Stream();
$c_sci_Stream$Cons.prototype.constructor = $c_sci_Stream$Cons;
/** @constructor */
function $h_sci_Stream$Cons() {
  /*<skip>*/
}
$h_sci_Stream$Cons.prototype = $c_sci_Stream$Cons.prototype;
$c_sci_Stream$Cons.prototype.head__O = (function() {
  return this.head$5
});
$c_sci_Stream$Cons.prototype.tail__sci_Stream = (function() {
  if ((!this.tailDefined__Z())) {
    if ((!this.tailDefined__Z())) {
      this.tlVal$5 = $as_sci_Stream(this.tlGen$5.apply__O());
      this.tlGen$5 = null
    }
  };
  return this.tlVal$5
});
$c_sci_Stream$Cons.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_Stream$Cons.prototype.tailDefined__Z = (function() {
  return (this.tlGen$5 === null)
});
$c_sci_Stream$Cons.prototype.tail__O = (function() {
  return this.tail__sci_Stream()
});
$c_sci_Stream$Cons.prototype.force__sci_Stream = (function() {
  return this.force__sci_Stream$Cons()
});
$c_sci_Stream$Cons.prototype.force__sci_Stream$Cons = (function() {
  var these = this;
  var those = this;
  if ((!these.isEmpty__Z())) {
    these = $as_sci_Stream(these.tail__O())
  };
  while ((those !== these)) {
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if ((these === those)) {
      return this
    };
    those = $as_sci_Stream(those.tail__O())
  };
  return this
});
$c_sci_Stream$Cons.prototype.init___O__F0 = (function(head, tl) {
  this.head$5 = head;
  this.tlGen$5 = tl;
  return this
});
var $d_sci_Stream$Cons = new $TypeData().initClass({
  sci_Stream$Cons: 0
}, false, "scala.collection.immutable.Stream$Cons", {
  sci_Stream$Cons: 1,
  sci_Stream: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_LinearSeq: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqOps: 1,
  sci_LinearSeqOps: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Cons.prototype.$classData = $d_sci_Stream$Cons;
/** @constructor */
function $c_sci_Stream$Empty$() {
  $c_sci_Stream.call(this)
}
$c_sci_Stream$Empty$.prototype = new $h_sci_Stream();
$c_sci_Stream$Empty$.prototype.constructor = $c_sci_Stream$Empty$;
/** @constructor */
function $h_sci_Stream$Empty$() {
  /*<skip>*/
}
$h_sci_Stream$Empty$.prototype = $c_sci_Stream$Empty$.prototype;
$c_sci_Stream$Empty$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Stream$Empty$.prototype.init___ = (function() {
  return this
});
$c_sci_Stream$Empty$.prototype.tail__sci_Stream = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty stream")
});
$c_sci_Stream$Empty$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Stream$Empty$.prototype.tailDefined__Z = (function() {
  return false
});
$c_sci_Stream$Empty$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty stream")
});
$c_sci_Stream$Empty$.prototype.tail__O = (function() {
  return this.tail__sci_Stream()
});
$c_sci_Stream$Empty$.prototype.force__sci_Stream = (function() {
  return this
});
$c_sci_Stream$Empty$.prototype.knownSize__I = (function() {
  return 0
});
var $d_sci_Stream$Empty$ = new $TypeData().initClass({
  sci_Stream$Empty$: 0
}, false, "scala.collection.immutable.Stream$Empty$", {
  sci_Stream$Empty$: 1,
  sci_Stream: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_LinearSeq: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqOps: 1,
  sci_LinearSeqOps: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Empty$.prototype.$classData = $d_sci_Stream$Empty$;
var $n_sci_Stream$Empty$ = (void 0);
function $m_sci_Stream$Empty$() {
  if ((!$n_sci_Stream$Empty$)) {
    $n_sci_Stream$Empty$ = new $c_sci_Stream$Empty$().init___()
  };
  return $n_sci_Stream$Empty$
}
/** @constructor */
function $c_scm_AbstractBuffer() {
  $c_scm_AbstractSeq.call(this)
}
$c_scm_AbstractBuffer.prototype = new $h_scm_AbstractSeq();
$c_scm_AbstractBuffer.prototype.constructor = $c_scm_AbstractBuffer;
/** @constructor */
function $h_scm_AbstractBuffer() {
  /*<skip>*/
}
$h_scm_AbstractBuffer.prototype = $c_scm_AbstractBuffer.prototype;
$c_scm_AbstractBuffer.prototype.addAll__sc_IterableOnce__scm_Growable = (function(xs) {
  return $f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this, xs)
});
/** @constructor */
function $c_scm_AbstractMap() {
  $c_sc_AbstractMap.call(this)
}
$c_scm_AbstractMap.prototype = new $h_sc_AbstractMap();
$c_scm_AbstractMap.prototype.constructor = $c_scm_AbstractMap;
/** @constructor */
function $h_scm_AbstractMap() {
  /*<skip>*/
}
$h_scm_AbstractMap.prototype = $c_scm_AbstractMap.prototype;
$c_scm_AbstractMap.prototype.result__O = (function() {
  return this
});
$c_scm_AbstractMap.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_scm_Iterable$()
});
$c_scm_AbstractMap.prototype.addAll__sc_IterableOnce__scm_Growable = (function(xs) {
  return $f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this, xs)
});
$c_scm_AbstractMap.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_AbstractMap.prototype.knownSize__I = (function() {
  return (-1)
});
/** @constructor */
function $c_sjs_js_WrappedDictionary() {
  $c_scm_AbstractMap.call(this);
  this.dict$4 = null
}
$c_sjs_js_WrappedDictionary.prototype = new $h_scm_AbstractMap();
$c_sjs_js_WrappedDictionary.prototype.constructor = $c_sjs_js_WrappedDictionary;
/** @constructor */
function $h_sjs_js_WrappedDictionary() {
  /*<skip>*/
}
$h_sjs_js_WrappedDictionary.prototype = $c_sjs_js_WrappedDictionary.prototype;
$c_sjs_js_WrappedDictionary.prototype.addOne__T2__sjs_js_WrappedDictionary = (function(kv) {
  this.dict$4[$as_T(kv.$$und1$f)] = kv.$$und2$f;
  return this
});
$c_sjs_js_WrappedDictionary.prototype.apply__O__O = (function(key) {
  return this.apply__T__O($as_T(key))
});
$c_sjs_js_WrappedDictionary.prototype.init___sjs_js_Dictionary = (function(dict) {
  this.dict$4 = dict;
  return this
});
$c_sjs_js_WrappedDictionary.prototype.fromSpecific__sc_IterableOnce__O = (function(coll) {
  return this.fromSpecific__sc_IterableOnce__sjs_js_WrappedDictionary(coll)
});
$c_sjs_js_WrappedDictionary.prototype.fromSpecific__sc_IterableOnce__sjs_js_WrappedDictionary = (function(coll) {
  var d = new $c_sjs_js_WrappedDictionary().init___sjs_js_Dictionary({});
  $f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(d, coll);
  return d
});
$c_sjs_js_WrappedDictionary.prototype.iterator__sc_Iterator = (function() {
  return new $c_sjs_js_WrappedDictionary$DictionaryIterator().init___sjs_js_Dictionary(this.dict$4)
});
$c_sjs_js_WrappedDictionary.prototype.get__T__s_Option = (function(key) {
  var dict = this.dict$4;
  if ($uZ($m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1.call(dict, key))) {
    return new $c_s_Some().init___O(this.dict$4[key])
  } else {
    return $m_s_None$()
  }
});
$c_sjs_js_WrappedDictionary.prototype.apply__T__O = (function(key) {
  var dict = this.dict$4;
  if ($uZ($m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1.call(dict, key))) {
    return this.dict$4[key]
  } else {
    throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
  }
});
$c_sjs_js_WrappedDictionary.prototype.addOne__O__scm_Growable = (function(elem) {
  return this.addOne__T2__sjs_js_WrappedDictionary($as_T2(elem))
});
$c_sjs_js_WrappedDictionary.prototype.fromSpecific__sc_IterableOnce__sc_IterableOps = (function(coll) {
  return this.fromSpecific__sc_IterableOnce__sjs_js_WrappedDictionary(coll)
});
var $d_sjs_js_WrappedDictionary = new $TypeData().initClass({
  sjs_js_WrappedDictionary: 0
}, false, "scala.scalajs.js.WrappedDictionary", {
  sjs_js_WrappedDictionary: 1,
  scm_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Map: 1,
  sc_MapOps: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_MapFactoryDefaults: 1,
  s_Equals: 1,
  scm_Map: 1,
  scm_Iterable: 1,
  scm_MapOps: 1,
  scm_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Builder: 1,
  scm_Growable: 1,
  scm_Clearable: 1,
  scm_Shrinkable: 1
});
$c_sjs_js_WrappedDictionary.prototype.$classData = $d_sjs_js_WrappedDictionary;
/** @constructor */
function $c_sci_Vector() {
  $c_sci_AbstractSeq.call(this);
  this.prefix1$4 = null
}
$c_sci_Vector.prototype = new $h_sci_AbstractSeq();
$c_sci_Vector.prototype.constructor = $c_sci_Vector;
/** @constructor */
function $h_sci_Vector() {
  /*<skip>*/
}
$h_sci_Vector.prototype = $c_sci_Vector.prototype;
$c_sci_Vector.prototype.head__O = (function() {
  if ((this.prefix1$4.u.length === 0)) {
    throw new $c_ju_NoSuchElementException().init___T("empty.head")
  } else {
    return this.prefix1$4.get(0)
  }
});
$c_sci_Vector.prototype.lengthCompare__I__I = (function(len) {
  var x = this.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1))
});
$c_sci_Vector.prototype.applyPreferredMaxLength__I = (function() {
  return $m_sci_Vector$().scala$collection$immutable$Vector$$defaultApplyPreferredMaxLength$1
});
$c_sci_Vector.prototype.sameElements__sc_IterableOnce__Z = (function(o) {
  return $f_sci_IndexedSeq__sameElements__sc_IterableOnce__Z(this, o)
});
$c_sci_Vector.prototype.foreach__F1__V = (function(f) {
  var c = this.vectorSliceCount__I();
  var i = 0;
  while ((i < c)) {
    var jsx$1 = $m_sci_VectorStatics$();
    var idx = i;
    var c$1 = ((c / 2) | 0);
    var a = ((idx - c$1) | 0);
    jsx$1.foreachRec__I__AO__F1__V((((-1) + ((((1 + c$1) | 0) - ((a < 0) ? ((-a) | 0) : a)) | 0)) | 0), this.vectorSlice__I__AO(i), f);
    i = ((1 + i) | 0)
  }
});
$c_sci_Vector.prototype.canEqual__O__Z = (function(that) {
  return $f_sci_IndexedSeq__canEqual__O__Z(this, that)
});
$c_sci_Vector.prototype.init___AO = (function(prefix1) {
  this.prefix1$4 = prefix1;
  return this
});
$c_sci_Vector.prototype.iterator__sc_Iterator = (function() {
  return (($m_sci_Vector0$() === this) ? $m_sci_Vector$().scala$collection$immutable$Vector$$emptyIterator$1 : new $c_sci_NewVectorIterator().init___sci_Vector__I__I(this, this.length__I(), this.vectorSliceCount__I()))
});
$c_sci_Vector.prototype.length__I = (function() {
  return ((this instanceof $c_sci_BigVector) ? $as_sci_BigVector(this).length0$6 : this.prefix1$4.u.length)
});
$c_sci_Vector.prototype.prependedAll__sc_IterableOnce__O = (function(prefix) {
  return $as_sci_Vector($f_sc_StrictOptimizedSeqOps__prependedAll__sc_IterableOnce__O(this, prefix))
});
$c_sci_Vector.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_sci_Vector$()
});
$c_sci_Vector.prototype.drop__I__O = (function(n) {
  var until = this.length__I();
  return this.slice__I__I__sci_Vector(n, until)
});
$c_sci_Vector.prototype.ioob__I__jl_IndexOutOfBoundsException = (function(index) {
  return new $c_jl_IndexOutOfBoundsException().init___T((((index + " is out of bounds (min 0, max ") + (((-1) + this.length__I()) | 0)) + ")"))
});
$c_sci_Vector.prototype.className__T = (function() {
  return "Vector"
});
$c_sci_Vector.prototype.knownSize__I = (function() {
  return this.length__I()
});
$c_sci_Vector.prototype.iterableFactory__sc_SeqFactory = (function() {
  return $m_sci_Vector$()
});
$c_sci_Vector.prototype.stringPrefix__T = (function() {
  return "IndexedSeq"
});
function $as_sci_Vector(obj) {
  return (((obj instanceof $c_sci_Vector) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector"))
}
function $isArrayOf_sci_Vector(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector)))
}
function $asArrayOf_sci_Vector(obj, depth) {
  return (($isArrayOf_sci_Vector(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector;", depth))
}
/** @constructor */
function $c_sci_ArraySeq$ofRef() {
  /*<skip>*/
}
function $as_sci_ArraySeq$ofRef(obj) {
  return (((obj instanceof $c_sci_ArraySeq$ofRef) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.ArraySeq$ofRef"))
}
function $isArrayOf_sci_ArraySeq$ofRef(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ArraySeq$ofRef)))
}
function $asArrayOf_sci_ArraySeq$ofRef(obj, depth) {
  return (($isArrayOf_sci_ArraySeq$ofRef(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.ArraySeq$ofRef;", depth))
}
/** @constructor */
function $c_sci_List() {
  $c_sci_AbstractSeq.call(this)
}
$c_sci_List.prototype = new $h_sci_AbstractSeq();
$c_sci_List.prototype.constructor = $c_sci_List;
/** @constructor */
function $h_sci_List() {
  /*<skip>*/
}
$h_sci_List.prototype = $c_sci_List.prototype;
$c_sci_List.prototype.prepended__O__sci_List = (function(elem) {
  return new $c_sci_$colon$colon().init___O__sci_List(elem, this)
});
$c_sci_List.prototype.apply__I__O = (function(n) {
  return $f_sc_LinearSeqOps__apply__I__O(this, n)
});
$c_sci_List.prototype.lengthCompare__I__I = (function(len) {
  return ((len < 0) ? 1 : this.loop$2__p4__I__sci_List__I__I(0, this, len))
});
$c_sci_List.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOps__apply__I__O(this, n)
});
$c_sci_List.prototype.isEmpty__Z = (function() {
  return (this === $m_sci_Nil$())
});
$c_sci_List.prototype.sameElements__sc_IterableOnce__Z = (function(that) {
  return $f_sc_LinearSeqOps__sameElements__sc_IterableOnce__Z(this, that)
});
$c_sci_List.prototype.equals__O__Z = (function(o) {
  if ((o instanceof $c_sci_List)) {
    var x2 = $as_sci_List(o);
    return this.listEq$1__p4__sci_List__sci_List__Z(this, x2)
  } else {
    return $f_sc_Seq__equals__O__Z(this, o)
  }
});
$c_sci_List.prototype.loop$2__p4__I__sci_List__I__I = (function(i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      var temp$i = ((1 + i) | 0);
      var temp$xs = $as_sci_List(xs.tail__O());
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
});
$c_sci_List.prototype.foreach__F1__V = (function(f) {
  var these = this;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    these = $as_sci_List(these.tail__O())
  }
});
$c_sci_List.prototype.listEq$1__p4__sci_List__sci_List__Z = (function(a, b) {
  _listEq: while (true) {
    if ((a === b)) {
      return true
    } else {
      var aEmpty = a.isEmpty__Z();
      var bEmpty = b.isEmpty__Z();
      if (((!(aEmpty || bEmpty)) && $m_sr_BoxesRunTime$().equals__O__O__Z(a.head__O(), b.head__O()))) {
        var temp$a = $as_sci_List(a.tail__O());
        var temp$b = $as_sci_List(b.tail__O());
        a = temp$a;
        b = temp$b;
        continue _listEq
      } else {
        return (aEmpty && bEmpty)
      }
    }
  }
});
$c_sci_List.prototype.$$colon$colon$colon__sci_List__sci_List = (function(prefix) {
  if (this.isEmpty__Z()) {
    return prefix
  } else if (prefix.isEmpty__Z()) {
    return this
  } else {
    var result = new $c_sci_$colon$colon().init___O__sci_List(prefix.head__O(), this);
    var curr = result;
    var that = $as_sci_List(prefix.tail__O());
    while ((!that.isEmpty__Z())) {
      var temp = new $c_sci_$colon$colon().init___O__sci_List(that.head__O(), this);
      curr.next$5 = temp;
      curr = temp;
      that = $as_sci_List(that.tail__O())
    };
    return result
  }
});
$c_sci_List.prototype.prepended__O__O = (function(elem) {
  return this.prepended__O__sci_List(elem)
});
$c_sci_List.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_StrictOptimizedLinearSeqOps$$anon$1().init___sc_StrictOptimizedLinearSeqOps(this)
});
$c_sci_List.prototype.length__I = (function() {
  var these = this;
  var len = 0;
  while ((!these.isEmpty__Z())) {
    len = ((1 + len) | 0);
    these = $as_sci_List(these.tail__O())
  };
  return len
});
$c_sci_List.prototype.prependedAll__sc_IterableOnce__O = (function(prefix) {
  return this.prependedAll__sc_IterableOnce__sci_List(prefix)
});
$c_sci_List.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_sci_List$()
});
$c_sci_List.prototype.prependedAll__sc_IterableOnce__sci_List = (function(prefix) {
  if ((prefix instanceof $c_sci_List)) {
    var x2 = $as_sci_List(prefix);
    return this.$$colon$colon$colon__sci_List__sci_List(x2)
  };
  if ((prefix.knownSize__I() === 0)) {
    return this
  };
  if ((prefix instanceof $c_scm_ListBuffer)) {
    var x3 = $as_scm_ListBuffer(prefix);
    if (this.isEmpty__Z()) {
      return x3.toList__sci_List()
    }
  };
  var iter = prefix.iterator__sc_Iterator();
  if (iter.hasNext__Z()) {
    var result = new $c_sci_$colon$colon().init___O__sci_List(iter.next__O(), this);
    var curr = result;
    while (iter.hasNext__Z()) {
      var temp = new $c_sci_$colon$colon().init___O__sci_List(iter.next__O(), this);
      curr.next$5 = temp;
      curr = temp
    };
    return result
  } else {
    return this
  }
});
$c_sci_List.prototype.drop__I__O = (function(n) {
  var n$1 = n;
  var s = this;
  return $f_sc_StrictOptimizedLinearSeqOps__loop$2__psc_StrictOptimizedLinearSeqOps__I__sc_LinearSeq__sc_LinearSeq(this, n$1, s)
});
$c_sci_List.prototype.className__T = (function() {
  return "List"
});
$c_sci_List.prototype.iterableFactory__sc_SeqFactory = (function() {
  return $m_sci_List$()
});
$c_sci_List.prototype.stringPrefix__T = (function() {
  return "LinearSeq"
});
function $as_sci_List(obj) {
  return (((obj instanceof $c_sci_List) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.List"))
}
function $isArrayOf_sci_List(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)))
}
function $asArrayOf_sci_List(obj, depth) {
  return (($isArrayOf_sci_List(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.List;", depth))
}
/** @constructor */
function $c_sci_VectorImpl() {
  $c_sci_Vector.call(this)
}
$c_sci_VectorImpl.prototype = new $h_sci_Vector();
$c_sci_VectorImpl.prototype.constructor = $c_sci_VectorImpl;
/** @constructor */
function $h_sci_VectorImpl() {
  /*<skip>*/
}
$h_sci_VectorImpl.prototype = $c_sci_VectorImpl.prototype;
$c_sci_VectorImpl.prototype.slice__I__I__sci_Vector = (function(from, until) {
  var lo = ((from > 0) ? from : 0);
  var b = this.length__I();
  var hi = ((until < b) ? until : b);
  var newlen = ((hi - lo) | 0);
  return ((newlen === this.length__I()) ? this : ((newlen <= 0) ? $m_sci_Vector0$() : this.slice0__I__I__sci_Vector(lo, hi)))
});
/** @constructor */
function $c_scm_ArraySeq$ofChar() {
  /*<skip>*/
}
function $as_scm_ArraySeq$ofChar(obj) {
  return (((obj instanceof $c_scm_ArraySeq$ofChar) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArraySeq$ofChar"))
}
function $isArrayOf_scm_ArraySeq$ofChar(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArraySeq$ofChar)))
}
function $asArrayOf_scm_ArraySeq$ofChar(obj, depth) {
  return (($isArrayOf_scm_ArraySeq$ofChar(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArraySeq$ofChar;", depth))
}
/** @constructor */
function $c_sci_BigVector() {
  $c_sci_VectorImpl.call(this);
  this.suffix1$6 = null;
  this.length0$6 = 0
}
$c_sci_BigVector.prototype = new $h_sci_VectorImpl();
$c_sci_BigVector.prototype.constructor = $c_sci_BigVector;
/** @constructor */
function $h_sci_BigVector() {
  /*<skip>*/
}
$h_sci_BigVector.prototype = $c_sci_BigVector.prototype;
$c_sci_BigVector.prototype.init___AO__AO__I = (function(_prefix1, suffix1, length0) {
  this.suffix1$6 = suffix1;
  this.length0$6 = length0;
  $c_sci_Vector.prototype.init___AO.call(this, _prefix1);
  return this
});
function $as_sci_BigVector(obj) {
  return (((obj instanceof $c_sci_BigVector) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.BigVector"))
}
function $isArrayOf_sci_BigVector(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_BigVector)))
}
function $asArrayOf_sci_BigVector(obj, depth) {
  return (($isArrayOf_sci_BigVector(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.BigVector;", depth))
}
/** @constructor */
function $c_sci_Vector1() {
  $c_sci_VectorImpl.call(this)
}
$c_sci_Vector1.prototype = new $h_sci_VectorImpl();
$c_sci_Vector1.prototype.constructor = $c_sci_Vector1;
/** @constructor */
function $h_sci_Vector1() {
  /*<skip>*/
}
$h_sci_Vector1.prototype = $c_sci_Vector1.prototype;
$c_sci_Vector1.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < this.prefix1$4.u.length))) {
    return this.prefix1$4.get(index)
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector1.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < this.prefix1$4.u.length))) {
    return this.prefix1$4.get(index)
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector1.prototype.vectorSliceCount__I = (function() {
  return 1
});
$c_sci_Vector1.prototype.slice0__I__I__sci_Vector = (function(lo, hi) {
  return new $c_sci_Vector1().init___AO($m_ju_Arrays$().copyOfRange__AO__I__I__AO(this.prefix1$4, lo, hi))
});
$c_sci_Vector1.prototype.tail__sci_Vector = (function() {
  if ((this.prefix1$4.u.length === 1)) {
    return $m_sci_Vector0$()
  } else {
    var a = this.prefix1$4;
    return new $c_sci_Vector1().init___AO($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a, 1, a.u.length))
  }
});
$c_sci_Vector1.prototype.prepended__O__O = (function(elem) {
  return this.prepended__O__sci_Vector(elem)
});
$c_sci_Vector1.prototype.init___AO = (function(_data1) {
  $c_sci_Vector.prototype.init___AO.call(this, _data1);
  return this
});
$c_sci_Vector1.prototype.prepended__O__sci_Vector = (function(elem) {
  var len1 = this.prefix1$4.u.length;
  if ((len1 < 32)) {
    return new $c_sci_Vector1().init___AO($m_sci_VectorStatics$().copyPrepend1__O__AO__AO(elem, this.prefix1$4))
  } else {
    var a = $newArrayObject($d_O.getArrayOf(), [1]);
    a.set(0, elem);
    return new $c_sci_Vector2().init___AO__I__AAO__AO__I(a, 1, $m_sci_VectorStatics$().empty2$1, this.prefix1$4, ((1 + len1) | 0))
  }
});
$c_sci_Vector1.prototype.tail__O = (function() {
  return this.tail__sci_Vector()
});
$c_sci_Vector1.prototype.vectorSlice__I__AO = (function(idx) {
  return this.prefix1$4
});
function $as_sci_Vector1(obj) {
  return (((obj instanceof $c_sci_Vector1) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector1"))
}
function $isArrayOf_sci_Vector1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector1)))
}
function $asArrayOf_sci_Vector1(obj, depth) {
  return (($isArrayOf_sci_Vector1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector1;", depth))
}
var $d_sci_Vector1 = new $TypeData().initClass({
  sci_Vector1: 0
}, false, "scala.collection.immutable.Vector1", {
  sci_Vector1: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  sci_IndexedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  scg_DefaultSerializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector1.prototype.$classData = $d_sci_Vector1;
/** @constructor */
function $c_sci_$colon$colon() {
  $c_sci_List.call(this);
  this.head$5 = null;
  this.next$5 = null
}
$c_sci_$colon$colon.prototype = new $h_sci_List();
$c_sci_$colon$colon.prototype.constructor = $c_sci_$colon$colon;
/** @constructor */
function $h_sci_$colon$colon() {
  /*<skip>*/
}
$h_sci_$colon$colon.prototype = $c_sci_$colon$colon.prototype;
$c_sci_$colon$colon.prototype.head__O = (function() {
  return this.head$5
});
$c_sci_$colon$colon.prototype.productPrefix__T = (function() {
  return "::"
});
$c_sci_$colon$colon.prototype.productArity__I = (function() {
  return 2
});
$c_sci_$colon$colon.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.head$5;
      break
    }
    case 1: {
      return this.next$5;
      break
    }
    default: {
      return $m_sr_Statics$().ioobe__I__O(x$1)
    }
  }
});
$c_sci_$colon$colon.prototype.tail__O = (function() {
  return this.next$5
});
$c_sci_$colon$colon.prototype.init___O__sci_List = (function(head, next) {
  this.head$5 = head;
  this.next$5 = next;
  return this
});
$c_sci_$colon$colon.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_$colon$colon = new $TypeData().initClass({
  sci_$colon$colon: 0
}, false, "scala.collection.immutable.$colon$colon", {
  sci_$colon$colon: 1,
  sci_List: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_LinearSeq: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqOps: 1,
  sci_LinearSeqOps: 1,
  sc_StrictOptimizedLinearSeqOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  scg_DefaultSerializable: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1
});
$c_sci_$colon$colon.prototype.$classData = $d_sci_$colon$colon;
/** @constructor */
function $c_sci_Nil$() {
  $c_sci_List.call(this);
  this.EmptyUnzip$5 = null
}
$c_sci_Nil$.prototype = new $h_sci_List();
$c_sci_Nil$.prototype.constructor = $c_sci_Nil$;
/** @constructor */
function $h_sci_Nil$() {
  /*<skip>*/
}
$h_sci_Nil$.prototype = $c_sci_Nil$.prototype;
$c_sci_Nil$.prototype.productPrefix__T = (function() {
  return "Nil"
});
$c_sci_Nil$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Nil$.prototype.init___ = (function() {
  $n_sci_Nil$ = this;
  this.EmptyUnzip$5 = new $c_T2().init___O__O($m_sci_Nil$(), $m_sci_Nil$());
  return this
});
$c_sci_Nil$.prototype.productArity__I = (function() {
  return 0
});
$c_sci_Nil$.prototype.productElement__I__O = (function(x$1) {
  return $m_sr_Statics$().ioobe__I__O(x$1)
});
$c_sci_Nil$.prototype.tail__sr_Nothing$ = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty list")
});
$c_sci_Nil$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty list")
});
$c_sci_Nil$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().scala$collection$Iterator$$$undempty$f
});
$c_sci_Nil$.prototype.tail__O = (function() {
  this.tail__sr_Nothing$()
});
$c_sci_Nil$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_sci_Nil$.prototype.knownSize__I = (function() {
  return 0
});
var $d_sci_Nil$ = new $TypeData().initClass({
  sci_Nil$: 0
}, false, "scala.collection.immutable.Nil$", {
  sci_Nil$: 1,
  sci_List: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_LinearSeq: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqOps: 1,
  sci_LinearSeqOps: 1,
  sc_StrictOptimizedLinearSeqOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  scg_DefaultSerializable: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1
});
$c_sci_Nil$.prototype.$classData = $d_sci_Nil$;
var $n_sci_Nil$ = (void 0);
function $m_sci_Nil$() {
  if ((!$n_sci_Nil$)) {
    $n_sci_Nil$ = new $c_sci_Nil$().init___()
  };
  return $n_sci_Nil$
}
/** @constructor */
function $c_sci_Vector0$() {
  $c_sci_BigVector.call(this)
}
$c_sci_Vector0$.prototype = new $h_sci_BigVector();
$c_sci_Vector0$.prototype.constructor = $c_sci_Vector0$;
/** @constructor */
function $h_sci_Vector0$() {
  /*<skip>*/
}
$h_sci_Vector0$.prototype = $c_sci_Vector0$.prototype;
$c_sci_Vector0$.prototype.init___ = (function() {
  $c_sci_BigVector.prototype.init___AO__AO__I.call(this, $m_sci_VectorStatics$().empty1$1, $m_sci_VectorStatics$().empty1$1, 0);
  return this
});
$c_sci_Vector0$.prototype.apply__I__O = (function(i) {
  this.apply__I__sr_Nothing$(i)
});
$c_sci_Vector0$.prototype.apply__O__O = (function(v1) {
  this.apply__I__sr_Nothing$($uI(v1))
});
$c_sci_Vector0$.prototype.apply__I__sr_Nothing$ = (function(index) {
  throw this.ioob__I__jl_IndexOutOfBoundsException(index)
});
$c_sci_Vector0$.prototype.equals__O__Z = (function(o) {
  return ((this === o) || ((!(o instanceof $c_sci_Vector)) && $f_sc_Seq__equals__O__Z(this, o)))
});
$c_sci_Vector0$.prototype.vectorSliceCount__I = (function() {
  return 0
});
$c_sci_Vector0$.prototype.slice0__I__I__sci_Vector = (function(lo, hi) {
  return this
});
$c_sci_Vector0$.prototype.tail__sci_Vector = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("empty.tail")
});
$c_sci_Vector0$.prototype.prepended__O__O = (function(elem) {
  return this.prepended__O__sci_Vector(elem)
});
$c_sci_Vector0$.prototype.prepended__O__sci_Vector = (function(elem) {
  var a = $newArrayObject($d_O.getArrayOf(), [1]);
  a.set(0, elem);
  return new $c_sci_Vector1().init___AO(a)
});
$c_sci_Vector0$.prototype.tail__O = (function() {
  return this.tail__sci_Vector()
});
$c_sci_Vector0$.prototype.ioob__I__jl_IndexOutOfBoundsException = (function(index) {
  return new $c_jl_IndexOutOfBoundsException().init___T((index + " is out of bounds (empty vector)"))
});
$c_sci_Vector0$.prototype.vectorSlice__I__AO = (function(idx) {
  return null
});
var $d_sci_Vector0$ = new $TypeData().initClass({
  sci_Vector0$: 0
}, false, "scala.collection.immutable.Vector0$", {
  sci_Vector0$: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  sci_IndexedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  scg_DefaultSerializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector0$.prototype.$classData = $d_sci_Vector0$;
var $n_sci_Vector0$ = (void 0);
function $m_sci_Vector0$() {
  if ((!$n_sci_Vector0$)) {
    $n_sci_Vector0$ = new $c_sci_Vector0$().init___()
  };
  return $n_sci_Vector0$
}
/** @constructor */
function $c_sci_Vector2() {
  $c_sci_BigVector.call(this);
  this.len1$7 = 0;
  this.data2$7 = null
}
$c_sci_Vector2.prototype = new $h_sci_BigVector();
$c_sci_Vector2.prototype.constructor = $c_sci_Vector2;
/** @constructor */
function $h_sci_Vector2() {
  /*<skip>*/
}
$h_sci_Vector2.prototype = $c_sci_Vector2.prototype;
$c_sci_Vector2.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < this.length0$6))) {
    var io = ((index - this.len1$7) | 0);
    if ((io >= 0)) {
      var i2 = ((io >>> 5) | 0);
      var i1 = (31 & io);
      return ((i2 < this.data2$7.u.length) ? this.data2$7.get(i2).get(i1) : this.suffix1$6.get((31 & io)))
    } else {
      return this.prefix1$4.get(index)
    }
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector2.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < this.length0$6))) {
    var io = ((index - this.len1$7) | 0);
    if ((io >= 0)) {
      var i2 = ((io >>> 5) | 0);
      var i1 = (31 & io);
      return ((i2 < this.data2$7.u.length) ? this.data2$7.get(i2).get(i1) : this.suffix1$6.get((31 & io)))
    } else {
      return this.prefix1$4.get(index)
    }
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector2.prototype.vectorSliceCount__I = (function() {
  return 3
});
$c_sci_Vector2.prototype.slice0__I__I__sci_Vector = (function(lo, hi) {
  var b = new $c_sci_VectorSliceBuilder().init___I__I(lo, hi);
  b.consider__I__AO__V(1, this.prefix1$4);
  b.consider__I__AO__V(2, this.data2$7);
  b.consider__I__AO__V(1, this.suffix1$6);
  return b.result__sci_Vector()
});
$c_sci_Vector2.prototype.tail__sci_Vector = (function() {
  if ((this.len1$7 > 1)) {
    var a = this.prefix1$4;
    var x$1 = $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a, 1, a.u.length);
    var x$2 = (((-1) + this.len1$7) | 0);
    var x$3 = (((-1) + this.length0$6) | 0);
    var x$4 = this.data2$7;
    var x$5 = this.suffix1$6;
    return new $c_sci_Vector2().init___AO__I__AAO__AO__I(x$1, x$2, x$4, x$5, x$3)
  } else {
    return this.slice0__I__I__sci_Vector(1, this.length0$6)
  }
});
$c_sci_Vector2.prototype.prepended__O__O = (function(elem) {
  return this.prepended__O__sci_Vector(elem)
});
$c_sci_Vector2.prototype.prepended__O__sci_Vector = (function(elem) {
  if ((this.len1$7 < 32)) {
    var x$1 = $m_sci_VectorStatics$().copyPrepend1__O__AO__AO(elem, this.prefix1$4);
    var x$2 = ((1 + this.len1$7) | 0);
    var x$3 = ((1 + this.length0$6) | 0);
    var x$4 = this.data2$7;
    var x$5 = this.suffix1$6;
    return new $c_sci_Vector2().init___AO__I__AAO__AO__I(x$1, x$2, x$4, x$5, x$3)
  } else if ((this.data2$7.u.length < 30)) {
    var a = $newArrayObject($d_O.getArrayOf(), [1]);
    a.set(0, elem);
    var x$8 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.data2$7), 2);
    var x$9 = ((1 + this.length0$6) | 0);
    var x$10 = this.suffix1$6;
    return new $c_sci_Vector2().init___AO__I__AAO__AO__I(a, 1, x$8, x$10, x$9)
  } else {
    var a$1 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$1.set(0, elem);
    var x = this.prefix1$4;
    var a$2 = $newArrayObject($d_O.getArrayOf().getArrayOf(), [1]);
    a$2.set(0, x);
    return new $c_sci_Vector3().init___AO__I__AAO__I__AAAO__AAO__AO__I(a$1, 1, a$2, ((1 + this.len1$7) | 0), $m_sci_VectorStatics$().empty3$1, this.data2$7, this.suffix1$6, ((1 + this.length0$6) | 0))
  }
});
$c_sci_Vector2.prototype.tail__O = (function() {
  return this.tail__sci_Vector()
});
$c_sci_Vector2.prototype.vectorSlice__I__AO = (function(idx) {
  switch (idx) {
    case 0: {
      return this.prefix1$4;
      break
    }
    case 1: {
      return this.data2$7;
      break
    }
    case 2: {
      return this.suffix1$6;
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(idx)
    }
  }
});
$c_sci_Vector2.prototype.init___AO__I__AAO__AO__I = (function(_prefix1, len1, data2, _suffix1, _length0) {
  this.len1$7 = len1;
  this.data2$7 = data2;
  $c_sci_BigVector.prototype.init___AO__AO__I.call(this, _prefix1, _suffix1, _length0);
  return this
});
function $as_sci_Vector2(obj) {
  return (((obj instanceof $c_sci_Vector2) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector2"))
}
function $isArrayOf_sci_Vector2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector2)))
}
function $asArrayOf_sci_Vector2(obj, depth) {
  return (($isArrayOf_sci_Vector2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector2;", depth))
}
var $d_sci_Vector2 = new $TypeData().initClass({
  sci_Vector2: 0
}, false, "scala.collection.immutable.Vector2", {
  sci_Vector2: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  sci_IndexedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  scg_DefaultSerializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector2.prototype.$classData = $d_sci_Vector2;
/** @constructor */
function $c_sci_Vector3() {
  $c_sci_BigVector.call(this);
  this.len1$7 = 0;
  this.prefix2$7 = null;
  this.len12$7 = 0;
  this.data3$7 = null;
  this.suffix2$7 = null
}
$c_sci_Vector3.prototype = new $h_sci_BigVector();
$c_sci_Vector3.prototype.constructor = $c_sci_Vector3;
/** @constructor */
function $h_sci_Vector3() {
  /*<skip>*/
}
$h_sci_Vector3.prototype = $c_sci_Vector3.prototype;
$c_sci_Vector3.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < this.length0$6))) {
    var io = ((index - this.len12$7) | 0);
    if ((io >= 0)) {
      var i3 = ((io >>> 10) | 0);
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i3 < this.data3$7.u.length) ? this.data3$7.get(i3).get(i2).get(i1) : ((i2 < this.suffix2$7.u.length) ? this.suffix2$7.get(i2).get(i1) : this.suffix1$6.get(i1)))
    } else if ((index >= this.len1$7)) {
      var io$2 = ((index - this.len1$7) | 0);
      return this.prefix2$7.get(((io$2 >>> 5) | 0)).get((31 & io$2))
    } else {
      return this.prefix1$4.get(index)
    }
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector3.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < this.length0$6))) {
    var io = ((index - this.len12$7) | 0);
    if ((io >= 0)) {
      var i3 = ((io >>> 10) | 0);
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i3 < this.data3$7.u.length) ? this.data3$7.get(i3).get(i2).get(i1) : ((i2 < this.suffix2$7.u.length) ? this.suffix2$7.get(i2).get(i1) : this.suffix1$6.get(i1)))
    } else if ((index >= this.len1$7)) {
      var io$2 = ((index - this.len1$7) | 0);
      return this.prefix2$7.get(((io$2 >>> 5) | 0)).get((31 & io$2))
    } else {
      return this.prefix1$4.get(index)
    }
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector3.prototype.vectorSliceCount__I = (function() {
  return 5
});
$c_sci_Vector3.prototype.slice0__I__I__sci_Vector = (function(lo, hi) {
  var b = new $c_sci_VectorSliceBuilder().init___I__I(lo, hi);
  b.consider__I__AO__V(1, this.prefix1$4);
  b.consider__I__AO__V(2, this.prefix2$7);
  b.consider__I__AO__V(3, this.data3$7);
  b.consider__I__AO__V(2, this.suffix2$7);
  b.consider__I__AO__V(1, this.suffix1$6);
  return b.result__sci_Vector()
});
$c_sci_Vector3.prototype.tail__sci_Vector = (function() {
  if ((this.len1$7 > 1)) {
    var a = this.prefix1$4;
    var x$1 = $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a, 1, a.u.length);
    var x$2 = (((-1) + this.len1$7) | 0);
    var x$3 = (((-1) + this.len12$7) | 0);
    var x$4 = (((-1) + this.length0$6) | 0);
    var x$5 = this.prefix2$7;
    var x$6 = this.data3$7;
    var x$7 = this.suffix2$7;
    var x$8 = this.suffix1$6;
    return new $c_sci_Vector3().init___AO__I__AAO__I__AAAO__AAO__AO__I(x$1, x$2, x$5, x$3, x$6, x$7, x$8, x$4)
  } else {
    return this.slice0__I__I__sci_Vector(1, this.length0$6)
  }
});
$c_sci_Vector3.prototype.prepended__O__O = (function(elem) {
  return this.prepended__O__sci_Vector(elem)
});
$c_sci_Vector3.prototype.prepended__O__sci_Vector = (function(elem) {
  if ((this.len1$7 < 32)) {
    var x$1 = $m_sci_VectorStatics$().copyPrepend1__O__AO__AO(elem, this.prefix1$4);
    var x$2 = ((1 + this.len1$7) | 0);
    var x$3 = ((1 + this.len12$7) | 0);
    var x$4 = ((1 + this.length0$6) | 0);
    var x$5 = this.prefix2$7;
    var x$6 = this.data3$7;
    var x$7 = this.suffix2$7;
    var x$8 = this.suffix1$6;
    return new $c_sci_Vector3().init___AO__I__AAO__I__AAAO__AAO__AO__I(x$1, x$2, x$5, x$3, x$6, x$7, x$8, x$4)
  } else if ((this.len12$7 < 1024)) {
    var a = $newArrayObject($d_O.getArrayOf(), [1]);
    a.set(0, elem);
    var x$11 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), 2);
    var x$12 = ((1 + this.len12$7) | 0);
    var x$13 = ((1 + this.length0$6) | 0);
    var x$14 = this.data3$7;
    var x$15 = this.suffix2$7;
    var x$16 = this.suffix1$6;
    return new $c_sci_Vector3().init___AO__I__AAO__I__AAAO__AAO__AO__I(a, 1, x$11, x$12, x$14, x$15, x$16, x$13)
  } else if ((this.data3$7.u.length < 30)) {
    var a$1 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$1.set(0, elem);
    var x$19 = $m_sci_VectorStatics$().empty2$1;
    var x$21 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.data3$7), 3);
    var x$22 = ((1 + this.length0$6) | 0);
    var x$23 = this.suffix2$7;
    var x$24 = this.suffix1$6;
    return new $c_sci_Vector3().init___AO__I__AAO__I__AAAO__AAO__AO__I(a$1, 1, x$19, 1, x$21, x$23, x$24, x$22)
  } else {
    var a$2 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$2.set(0, elem);
    var jsx$1 = $m_sci_VectorStatics$().empty2$1;
    var x = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), 2);
    var a$3 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf(), [1]);
    a$3.set(0, x);
    return new $c_sci_Vector4().init___AO__I__AAO__I__AAAO__I__AAAAO__AAAO__AAO__AO__I(a$2, 1, jsx$1, 1, a$3, ((1 + this.len12$7) | 0), $m_sci_VectorStatics$().empty4$1, this.data3$7, this.suffix2$7, this.suffix1$6, ((1 + this.length0$6) | 0))
  }
});
$c_sci_Vector3.prototype.tail__O = (function() {
  return this.tail__sci_Vector()
});
$c_sci_Vector3.prototype.vectorSlice__I__AO = (function(idx) {
  switch (idx) {
    case 0: {
      return this.prefix1$4;
      break
    }
    case 1: {
      return this.prefix2$7;
      break
    }
    case 2: {
      return this.data3$7;
      break
    }
    case 3: {
      return this.suffix2$7;
      break
    }
    case 4: {
      return this.suffix1$6;
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(idx)
    }
  }
});
$c_sci_Vector3.prototype.init___AO__I__AAO__I__AAAO__AAO__AO__I = (function(_prefix1, len1, prefix2, len12, data3, suffix2, _suffix1, _length0) {
  this.len1$7 = len1;
  this.prefix2$7 = prefix2;
  this.len12$7 = len12;
  this.data3$7 = data3;
  this.suffix2$7 = suffix2;
  $c_sci_BigVector.prototype.init___AO__AO__I.call(this, _prefix1, _suffix1, _length0);
  return this
});
function $as_sci_Vector3(obj) {
  return (((obj instanceof $c_sci_Vector3) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector3"))
}
function $isArrayOf_sci_Vector3(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector3)))
}
function $asArrayOf_sci_Vector3(obj, depth) {
  return (($isArrayOf_sci_Vector3(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector3;", depth))
}
var $d_sci_Vector3 = new $TypeData().initClass({
  sci_Vector3: 0
}, false, "scala.collection.immutable.Vector3", {
  sci_Vector3: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  sci_IndexedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  scg_DefaultSerializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector3.prototype.$classData = $d_sci_Vector3;
/** @constructor */
function $c_sci_Vector4() {
  $c_sci_BigVector.call(this);
  this.len1$7 = 0;
  this.prefix2$7 = null;
  this.len12$7 = 0;
  this.prefix3$7 = null;
  this.len123$7 = 0;
  this.data4$7 = null;
  this.suffix3$7 = null;
  this.suffix2$7 = null
}
$c_sci_Vector4.prototype = new $h_sci_BigVector();
$c_sci_Vector4.prototype.constructor = $c_sci_Vector4;
/** @constructor */
function $h_sci_Vector4() {
  /*<skip>*/
}
$h_sci_Vector4.prototype = $c_sci_Vector4.prototype;
$c_sci_Vector4.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < this.length0$6))) {
    var io = ((index - this.len123$7) | 0);
    if ((io >= 0)) {
      var i4 = ((io >>> 15) | 0);
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i4 < this.data4$7.u.length) ? this.data4$7.get(i4).get(i3).get(i2).get(i1) : ((i3 < this.suffix3$7.u.length) ? this.suffix3$7.get(i3).get(i2).get(i1) : ((i2 < this.suffix2$7.u.length) ? this.suffix2$7.get(i2).get(i1) : this.suffix1$6.get(i1))))
    } else if ((index >= this.len12$7)) {
      var io$2 = ((index - this.len12$7) | 0);
      return this.prefix3$7.get(((io$2 >>> 10) | 0)).get((31 & ((io$2 >>> 5) | 0))).get((31 & io$2))
    } else if ((index >= this.len1$7)) {
      var io$3 = ((index - this.len1$7) | 0);
      return this.prefix2$7.get(((io$3 >>> 5) | 0)).get((31 & io$3))
    } else {
      return this.prefix1$4.get(index)
    }
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector4.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < this.length0$6))) {
    var io = ((index - this.len123$7) | 0);
    if ((io >= 0)) {
      var i4 = ((io >>> 15) | 0);
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i4 < this.data4$7.u.length) ? this.data4$7.get(i4).get(i3).get(i2).get(i1) : ((i3 < this.suffix3$7.u.length) ? this.suffix3$7.get(i3).get(i2).get(i1) : ((i2 < this.suffix2$7.u.length) ? this.suffix2$7.get(i2).get(i1) : this.suffix1$6.get(i1))))
    } else if ((index >= this.len12$7)) {
      var io$2 = ((index - this.len12$7) | 0);
      return this.prefix3$7.get(((io$2 >>> 10) | 0)).get((31 & ((io$2 >>> 5) | 0))).get((31 & io$2))
    } else if ((index >= this.len1$7)) {
      var io$3 = ((index - this.len1$7) | 0);
      return this.prefix2$7.get(((io$3 >>> 5) | 0)).get((31 & io$3))
    } else {
      return this.prefix1$4.get(index)
    }
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector4.prototype.vectorSliceCount__I = (function() {
  return 7
});
$c_sci_Vector4.prototype.slice0__I__I__sci_Vector = (function(lo, hi) {
  var b = new $c_sci_VectorSliceBuilder().init___I__I(lo, hi);
  b.consider__I__AO__V(1, this.prefix1$4);
  b.consider__I__AO__V(2, this.prefix2$7);
  b.consider__I__AO__V(3, this.prefix3$7);
  b.consider__I__AO__V(4, this.data4$7);
  b.consider__I__AO__V(3, this.suffix3$7);
  b.consider__I__AO__V(2, this.suffix2$7);
  b.consider__I__AO__V(1, this.suffix1$6);
  return b.result__sci_Vector()
});
$c_sci_Vector4.prototype.tail__sci_Vector = (function() {
  if ((this.len1$7 > 1)) {
    var a = this.prefix1$4;
    var x$1 = $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a, 1, a.u.length);
    var x$2 = (((-1) + this.len1$7) | 0);
    var x$3 = (((-1) + this.len12$7) | 0);
    var x$4 = (((-1) + this.len123$7) | 0);
    var x$5 = (((-1) + this.length0$6) | 0);
    var x$6 = this.prefix2$7;
    var x$7 = this.prefix3$7;
    var x$8 = this.data4$7;
    var x$9 = this.suffix3$7;
    var x$10 = this.suffix2$7;
    var x$11 = this.suffix1$6;
    return new $c_sci_Vector4().init___AO__I__AAO__I__AAAO__I__AAAAO__AAAO__AAO__AO__I(x$1, x$2, x$6, x$3, x$7, x$4, x$8, x$9, x$10, x$11, x$5)
  } else {
    return this.slice0__I__I__sci_Vector(1, this.length0$6)
  }
});
$c_sci_Vector4.prototype.prepended__O__O = (function(elem) {
  return this.prepended__O__sci_Vector(elem)
});
$c_sci_Vector4.prototype.prepended__O__sci_Vector = (function(elem) {
  if ((this.len1$7 < 32)) {
    var x$1 = $m_sci_VectorStatics$().copyPrepend1__O__AO__AO(elem, this.prefix1$4);
    var x$2 = ((1 + this.len1$7) | 0);
    var x$3 = ((1 + this.len12$7) | 0);
    var x$4 = ((1 + this.len123$7) | 0);
    var x$5 = ((1 + this.length0$6) | 0);
    var x$6 = this.prefix2$7;
    var x$7 = this.prefix3$7;
    var x$8 = this.data4$7;
    var x$9 = this.suffix3$7;
    var x$10 = this.suffix2$7;
    var x$11 = this.suffix1$6;
    return new $c_sci_Vector4().init___AO__I__AAO__I__AAAO__I__AAAAO__AAAO__AAO__AO__I(x$1, x$2, x$6, x$3, x$7, x$4, x$8, x$9, x$10, x$11, x$5)
  } else if ((this.len12$7 < 1024)) {
    var a = $newArrayObject($d_O.getArrayOf(), [1]);
    a.set(0, elem);
    var x$14 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), 2);
    var x$15 = ((1 + this.len12$7) | 0);
    var x$16 = ((1 + this.len123$7) | 0);
    var x$17 = ((1 + this.length0$6) | 0);
    var x$18 = this.prefix3$7;
    var x$19 = this.data4$7;
    var x$20 = this.suffix3$7;
    var x$21 = this.suffix2$7;
    var x$22 = this.suffix1$6;
    return new $c_sci_Vector4().init___AO__I__AAO__I__AAAO__I__AAAAO__AAAO__AAO__AO__I(a, 1, x$14, x$15, x$18, x$16, x$19, x$20, x$21, x$22, x$17)
  } else if ((this.len123$7 < 32768)) {
    var a$1 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$1.set(0, elem);
    var x$25 = $m_sci_VectorStatics$().empty2$1;
    var x$27 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.prefix3$7), 3);
    var x$28 = ((1 + this.len123$7) | 0);
    var x$29 = ((1 + this.length0$6) | 0);
    var x$30 = this.data4$7;
    var x$31 = this.suffix3$7;
    var x$32 = this.suffix2$7;
    var x$33 = this.suffix1$6;
    return new $c_sci_Vector4().init___AO__I__AAO__I__AAAO__I__AAAAO__AAAO__AAO__AO__I(a$1, 1, x$25, 1, x$27, x$28, x$30, x$31, x$32, x$33, x$29)
  } else if ((this.data4$7.u.length < 30)) {
    var a$2 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$2.set(0, elem);
    var x$36 = $m_sci_VectorStatics$().empty2$1;
    var x$38 = $m_sci_VectorStatics$().empty3$1;
    var x$40 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.prefix3$7), this.data4$7), 4);
    var x$41 = ((1 + this.length0$6) | 0);
    var x$42 = this.suffix3$7;
    var x$43 = this.suffix2$7;
    var x$44 = this.suffix1$6;
    return new $c_sci_Vector4().init___AO__I__AAO__I__AAAO__I__AAAAO__AAAO__AAO__AO__I(a$2, 1, x$36, 1, x$38, 1, x$40, x$42, x$43, x$44, x$41)
  } else {
    var a$3 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$3.set(0, elem);
    var jsx$2 = $m_sci_VectorStatics$().empty2$1;
    var jsx$1 = $m_sci_VectorStatics$().empty3$1;
    var x = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.prefix3$7), 3);
    var a$4 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [1]);
    a$4.set(0, x);
    return new $c_sci_Vector5().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__AAAAO__AAAO__AAO__AO__I(a$3, 1, jsx$2, 1, jsx$1, 1, a$4, ((1 + this.len123$7) | 0), $m_sci_VectorStatics$().empty5$1, this.data4$7, this.suffix3$7, this.suffix2$7, this.suffix1$6, ((1 + this.length0$6) | 0))
  }
});
$c_sci_Vector4.prototype.tail__O = (function() {
  return this.tail__sci_Vector()
});
$c_sci_Vector4.prototype.vectorSlice__I__AO = (function(idx) {
  switch (idx) {
    case 0: {
      return this.prefix1$4;
      break
    }
    case 1: {
      return this.prefix2$7;
      break
    }
    case 2: {
      return this.prefix3$7;
      break
    }
    case 3: {
      return this.data4$7;
      break
    }
    case 4: {
      return this.suffix3$7;
      break
    }
    case 5: {
      return this.suffix2$7;
      break
    }
    case 6: {
      return this.suffix1$6;
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(idx)
    }
  }
});
$c_sci_Vector4.prototype.init___AO__I__AAO__I__AAAO__I__AAAAO__AAAO__AAO__AO__I = (function(_prefix1, len1, prefix2, len12, prefix3, len123, data4, suffix3, suffix2, _suffix1, _length0) {
  this.len1$7 = len1;
  this.prefix2$7 = prefix2;
  this.len12$7 = len12;
  this.prefix3$7 = prefix3;
  this.len123$7 = len123;
  this.data4$7 = data4;
  this.suffix3$7 = suffix3;
  this.suffix2$7 = suffix2;
  $c_sci_BigVector.prototype.init___AO__AO__I.call(this, _prefix1, _suffix1, _length0);
  return this
});
function $as_sci_Vector4(obj) {
  return (((obj instanceof $c_sci_Vector4) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector4"))
}
function $isArrayOf_sci_Vector4(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector4)))
}
function $asArrayOf_sci_Vector4(obj, depth) {
  return (($isArrayOf_sci_Vector4(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector4;", depth))
}
var $d_sci_Vector4 = new $TypeData().initClass({
  sci_Vector4: 0
}, false, "scala.collection.immutable.Vector4", {
  sci_Vector4: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  sci_IndexedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  scg_DefaultSerializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector4.prototype.$classData = $d_sci_Vector4;
/** @constructor */
function $c_sci_Vector5() {
  $c_sci_BigVector.call(this);
  this.len1$7 = 0;
  this.prefix2$7 = null;
  this.len12$7 = 0;
  this.prefix3$7 = null;
  this.len123$7 = 0;
  this.prefix4$7 = null;
  this.len1234$7 = 0;
  this.data5$7 = null;
  this.suffix4$7 = null;
  this.suffix3$7 = null;
  this.suffix2$7 = null
}
$c_sci_Vector5.prototype = new $h_sci_BigVector();
$c_sci_Vector5.prototype.constructor = $c_sci_Vector5;
/** @constructor */
function $h_sci_Vector5() {
  /*<skip>*/
}
$h_sci_Vector5.prototype = $c_sci_Vector5.prototype;
$c_sci_Vector5.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < this.length0$6))) {
    var io = ((index - this.len1234$7) | 0);
    if ((io >= 0)) {
      var i5 = ((io >>> 20) | 0);
      var i4 = (31 & ((io >>> 15) | 0));
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i5 < this.data5$7.u.length) ? this.data5$7.get(i5).get(i4).get(i3).get(i2).get(i1) : ((i4 < this.suffix4$7.u.length) ? this.suffix4$7.get(i4).get(i3).get(i2).get(i1) : ((i3 < this.suffix3$7.u.length) ? this.suffix3$7.get(i3).get(i2).get(i1) : ((i2 < this.suffix2$7.u.length) ? this.suffix2$7.get(i2).get(i1) : this.suffix1$6.get(i1)))))
    } else if ((index >= this.len123$7)) {
      var io$2 = ((index - this.len123$7) | 0);
      return this.prefix4$7.get(((io$2 >>> 15) | 0)).get((31 & ((io$2 >>> 10) | 0))).get((31 & ((io$2 >>> 5) | 0))).get((31 & io$2))
    } else if ((index >= this.len12$7)) {
      var io$3 = ((index - this.len12$7) | 0);
      return this.prefix3$7.get(((io$3 >>> 10) | 0)).get((31 & ((io$3 >>> 5) | 0))).get((31 & io$3))
    } else if ((index >= this.len1$7)) {
      var io$4 = ((index - this.len1$7) | 0);
      return this.prefix2$7.get(((io$4 >>> 5) | 0)).get((31 & io$4))
    } else {
      return this.prefix1$4.get(index)
    }
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector5.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < this.length0$6))) {
    var io = ((index - this.len1234$7) | 0);
    if ((io >= 0)) {
      var i5 = ((io >>> 20) | 0);
      var i4 = (31 & ((io >>> 15) | 0));
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i5 < this.data5$7.u.length) ? this.data5$7.get(i5).get(i4).get(i3).get(i2).get(i1) : ((i4 < this.suffix4$7.u.length) ? this.suffix4$7.get(i4).get(i3).get(i2).get(i1) : ((i3 < this.suffix3$7.u.length) ? this.suffix3$7.get(i3).get(i2).get(i1) : ((i2 < this.suffix2$7.u.length) ? this.suffix2$7.get(i2).get(i1) : this.suffix1$6.get(i1)))))
    } else if ((index >= this.len123$7)) {
      var io$2 = ((index - this.len123$7) | 0);
      return this.prefix4$7.get(((io$2 >>> 15) | 0)).get((31 & ((io$2 >>> 10) | 0))).get((31 & ((io$2 >>> 5) | 0))).get((31 & io$2))
    } else if ((index >= this.len12$7)) {
      var io$3 = ((index - this.len12$7) | 0);
      return this.prefix3$7.get(((io$3 >>> 10) | 0)).get((31 & ((io$3 >>> 5) | 0))).get((31 & io$3))
    } else if ((index >= this.len1$7)) {
      var io$4 = ((index - this.len1$7) | 0);
      return this.prefix2$7.get(((io$4 >>> 5) | 0)).get((31 & io$4))
    } else {
      return this.prefix1$4.get(index)
    }
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector5.prototype.vectorSliceCount__I = (function() {
  return 9
});
$c_sci_Vector5.prototype.slice0__I__I__sci_Vector = (function(lo, hi) {
  var b = new $c_sci_VectorSliceBuilder().init___I__I(lo, hi);
  b.consider__I__AO__V(1, this.prefix1$4);
  b.consider__I__AO__V(2, this.prefix2$7);
  b.consider__I__AO__V(3, this.prefix3$7);
  b.consider__I__AO__V(4, this.prefix4$7);
  b.consider__I__AO__V(5, this.data5$7);
  b.consider__I__AO__V(4, this.suffix4$7);
  b.consider__I__AO__V(3, this.suffix3$7);
  b.consider__I__AO__V(2, this.suffix2$7);
  b.consider__I__AO__V(1, this.suffix1$6);
  return b.result__sci_Vector()
});
$c_sci_Vector5.prototype.tail__sci_Vector = (function() {
  if ((this.len1$7 > 1)) {
    var a = this.prefix1$4;
    var x$1 = $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a, 1, a.u.length);
    var x$2 = (((-1) + this.len1$7) | 0);
    var x$3 = (((-1) + this.len12$7) | 0);
    var x$4 = (((-1) + this.len123$7) | 0);
    var x$5 = (((-1) + this.len1234$7) | 0);
    var x$6 = (((-1) + this.length0$6) | 0);
    var x$7 = this.prefix2$7;
    var x$8 = this.prefix3$7;
    var x$9 = this.prefix4$7;
    var x$10 = this.data5$7;
    var x$11 = this.suffix4$7;
    var x$12 = this.suffix3$7;
    var x$13 = this.suffix2$7;
    var x$14 = this.suffix1$6;
    return new $c_sci_Vector5().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__AAAAO__AAAO__AAO__AO__I(x$1, x$2, x$7, x$3, x$8, x$4, x$9, x$5, x$10, x$11, x$12, x$13, x$14, x$6)
  } else {
    return this.slice0__I__I__sci_Vector(1, this.length0$6)
  }
});
$c_sci_Vector5.prototype.prepended__O__O = (function(elem) {
  return this.prepended__O__sci_Vector(elem)
});
$c_sci_Vector5.prototype.prepended__O__sci_Vector = (function(elem) {
  if ((this.len1$7 < 32)) {
    var x$1 = $m_sci_VectorStatics$().copyPrepend1__O__AO__AO(elem, this.prefix1$4);
    var x$2 = ((1 + this.len1$7) | 0);
    var x$3 = ((1 + this.len12$7) | 0);
    var x$4 = ((1 + this.len123$7) | 0);
    var x$5 = ((1 + this.len1234$7) | 0);
    var x$6 = ((1 + this.length0$6) | 0);
    var x$7 = this.prefix2$7;
    var x$8 = this.prefix3$7;
    var x$9 = this.prefix4$7;
    var x$10 = this.data5$7;
    var x$11 = this.suffix4$7;
    var x$12 = this.suffix3$7;
    var x$13 = this.suffix2$7;
    var x$14 = this.suffix1$6;
    return new $c_sci_Vector5().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__AAAAO__AAAO__AAO__AO__I(x$1, x$2, x$7, x$3, x$8, x$4, x$9, x$5, x$10, x$11, x$12, x$13, x$14, x$6)
  } else if ((this.len12$7 < 1024)) {
    var a = $newArrayObject($d_O.getArrayOf(), [1]);
    a.set(0, elem);
    var x$17 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), 2);
    var x$18 = ((1 + this.len12$7) | 0);
    var x$19 = ((1 + this.len123$7) | 0);
    var x$20 = ((1 + this.len1234$7) | 0);
    var x$21 = ((1 + this.length0$6) | 0);
    var x$22 = this.prefix3$7;
    var x$23 = this.prefix4$7;
    var x$24 = this.data5$7;
    var x$25 = this.suffix4$7;
    var x$26 = this.suffix3$7;
    var x$27 = this.suffix2$7;
    var x$28 = this.suffix1$6;
    return new $c_sci_Vector5().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__AAAAO__AAAO__AAO__AO__I(a, 1, x$17, x$18, x$22, x$19, x$23, x$20, x$24, x$25, x$26, x$27, x$28, x$21)
  } else if ((this.len123$7 < 32768)) {
    var a$1 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$1.set(0, elem);
    var x$31 = $m_sci_VectorStatics$().empty2$1;
    var x$33 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.prefix3$7), 3);
    var x$34 = ((1 + this.len123$7) | 0);
    var x$35 = ((1 + this.len1234$7) | 0);
    var x$36 = ((1 + this.length0$6) | 0);
    var x$37 = this.prefix4$7;
    var x$38 = this.data5$7;
    var x$39 = this.suffix4$7;
    var x$40 = this.suffix3$7;
    var x$41 = this.suffix2$7;
    var x$42 = this.suffix1$6;
    return new $c_sci_Vector5().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__AAAAO__AAAO__AAO__AO__I(a$1, 1, x$31, 1, x$33, x$34, x$37, x$35, x$38, x$39, x$40, x$41, x$42, x$36)
  } else if ((this.len1234$7 < 1048576)) {
    var a$2 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$2.set(0, elem);
    var x$45 = $m_sci_VectorStatics$().empty2$1;
    var x$47 = $m_sci_VectorStatics$().empty3$1;
    var x$49 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.prefix3$7), this.prefix4$7), 4);
    var x$50 = ((1 + this.len1234$7) | 0);
    var x$51 = ((1 + this.length0$6) | 0);
    var x$52 = this.data5$7;
    var x$53 = this.suffix4$7;
    var x$54 = this.suffix3$7;
    var x$55 = this.suffix2$7;
    var x$56 = this.suffix1$6;
    return new $c_sci_Vector5().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__AAAAO__AAAO__AAO__AO__I(a$2, 1, x$45, 1, x$47, 1, x$49, x$50, x$52, x$53, x$54, x$55, x$56, x$51)
  } else if ((this.data5$7.u.length < 30)) {
    var a$3 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$3.set(0, elem);
    var x$59 = $m_sci_VectorStatics$().empty2$1;
    var x$61 = $m_sci_VectorStatics$().empty3$1;
    var x$63 = $m_sci_VectorStatics$().empty4$1;
    var x$65 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.prefix3$7), this.prefix4$7), this.data5$7), 5);
    var x$66 = ((1 + this.length0$6) | 0);
    var x$67 = this.suffix4$7;
    var x$68 = this.suffix3$7;
    var x$69 = this.suffix2$7;
    var x$70 = this.suffix1$6;
    return new $c_sci_Vector5().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__AAAAO__AAAO__AAO__AO__I(a$3, 1, x$59, 1, x$61, 1, x$63, 1, x$65, x$67, x$68, x$69, x$70, x$66)
  } else {
    var a$4 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$4.set(0, elem);
    var jsx$3 = $m_sci_VectorStatics$().empty2$1;
    var jsx$2 = $m_sci_VectorStatics$().empty3$1;
    var jsx$1 = $m_sci_VectorStatics$().empty4$1;
    var x = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.prefix3$7), this.prefix4$7), 4);
    var a$5 = $newArrayObject($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf(), [1]);
    a$5.set(0, x);
    return new $c_sci_Vector6().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__I__AAAAAAO__AAAAAO__AAAAO__AAAO__AAO__AO__I(a$4, 1, jsx$3, 1, jsx$2, 1, jsx$1, 1, a$5, ((1 + this.len1234$7) | 0), $m_sci_VectorStatics$().empty6$1, this.data5$7, this.suffix4$7, this.suffix3$7, this.suffix2$7, this.suffix1$6, ((1 + this.length0$6) | 0))
  }
});
$c_sci_Vector5.prototype.init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__AAAAO__AAAO__AAO__AO__I = (function(_prefix1, len1, prefix2, len12, prefix3, len123, prefix4, len1234, data5, suffix4, suffix3, suffix2, _suffix1, _length0) {
  this.len1$7 = len1;
  this.prefix2$7 = prefix2;
  this.len12$7 = len12;
  this.prefix3$7 = prefix3;
  this.len123$7 = len123;
  this.prefix4$7 = prefix4;
  this.len1234$7 = len1234;
  this.data5$7 = data5;
  this.suffix4$7 = suffix4;
  this.suffix3$7 = suffix3;
  this.suffix2$7 = suffix2;
  $c_sci_BigVector.prototype.init___AO__AO__I.call(this, _prefix1, _suffix1, _length0);
  return this
});
$c_sci_Vector5.prototype.tail__O = (function() {
  return this.tail__sci_Vector()
});
$c_sci_Vector5.prototype.vectorSlice__I__AO = (function(idx) {
  switch (idx) {
    case 0: {
      return this.prefix1$4;
      break
    }
    case 1: {
      return this.prefix2$7;
      break
    }
    case 2: {
      return this.prefix3$7;
      break
    }
    case 3: {
      return this.prefix4$7;
      break
    }
    case 4: {
      return this.data5$7;
      break
    }
    case 5: {
      return this.suffix4$7;
      break
    }
    case 6: {
      return this.suffix3$7;
      break
    }
    case 7: {
      return this.suffix2$7;
      break
    }
    case 8: {
      return this.suffix1$6;
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(idx)
    }
  }
});
function $as_sci_Vector5(obj) {
  return (((obj instanceof $c_sci_Vector5) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector5"))
}
function $isArrayOf_sci_Vector5(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector5)))
}
function $asArrayOf_sci_Vector5(obj, depth) {
  return (($isArrayOf_sci_Vector5(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector5;", depth))
}
var $d_sci_Vector5 = new $TypeData().initClass({
  sci_Vector5: 0
}, false, "scala.collection.immutable.Vector5", {
  sci_Vector5: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  sci_IndexedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  scg_DefaultSerializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector5.prototype.$classData = $d_sci_Vector5;
/** @constructor */
function $c_sci_Vector6() {
  $c_sci_BigVector.call(this);
  this.len1$7 = 0;
  this.prefix2$7 = null;
  this.len12$7 = 0;
  this.prefix3$7 = null;
  this.len123$7 = 0;
  this.prefix4$7 = null;
  this.len1234$7 = 0;
  this.prefix5$7 = null;
  this.len12345$7 = 0;
  this.data6$7 = null;
  this.suffix5$7 = null;
  this.suffix4$7 = null;
  this.suffix3$7 = null;
  this.suffix2$7 = null
}
$c_sci_Vector6.prototype = new $h_sci_BigVector();
$c_sci_Vector6.prototype.constructor = $c_sci_Vector6;
/** @constructor */
function $h_sci_Vector6() {
  /*<skip>*/
}
$h_sci_Vector6.prototype = $c_sci_Vector6.prototype;
$c_sci_Vector6.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < this.length0$6))) {
    var io = ((index - this.len12345$7) | 0);
    if ((io >= 0)) {
      var i6 = ((io >>> 25) | 0);
      var i5 = (31 & ((io >>> 20) | 0));
      var i4 = (31 & ((io >>> 15) | 0));
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i6 < this.data6$7.u.length) ? this.data6$7.get(i6).get(i5).get(i4).get(i3).get(i2).get(i1) : ((i5 < this.suffix5$7.u.length) ? this.suffix5$7.get(i5).get(i4).get(i3).get(i2).get(i1) : ((i4 < this.suffix4$7.u.length) ? this.suffix4$7.get(i4).get(i3).get(i2).get(i1) : ((i3 < this.suffix3$7.u.length) ? this.suffix3$7.get(i3).get(i2).get(i1) : ((i2 < this.suffix2$7.u.length) ? this.suffix2$7.get(i2).get(i1) : this.suffix1$6.get(i1))))))
    } else if ((index >= this.len1234$7)) {
      var io$2 = ((index - this.len1234$7) | 0);
      return this.prefix5$7.get(((io$2 >>> 20) | 0)).get((31 & ((io$2 >>> 15) | 0))).get((31 & ((io$2 >>> 10) | 0))).get((31 & ((io$2 >>> 5) | 0))).get((31 & io$2))
    } else if ((index >= this.len123$7)) {
      var io$3 = ((index - this.len123$7) | 0);
      return this.prefix4$7.get(((io$3 >>> 15) | 0)).get((31 & ((io$3 >>> 10) | 0))).get((31 & ((io$3 >>> 5) | 0))).get((31 & io$3))
    } else if ((index >= this.len12$7)) {
      var io$4 = ((index - this.len12$7) | 0);
      return this.prefix3$7.get(((io$4 >>> 10) | 0)).get((31 & ((io$4 >>> 5) | 0))).get((31 & io$4))
    } else if ((index >= this.len1$7)) {
      var io$5 = ((index - this.len1$7) | 0);
      return this.prefix2$7.get(((io$5 >>> 5) | 0)).get((31 & io$5))
    } else {
      return this.prefix1$4.get(index)
    }
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector6.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < this.length0$6))) {
    var io = ((index - this.len12345$7) | 0);
    if ((io >= 0)) {
      var i6 = ((io >>> 25) | 0);
      var i5 = (31 & ((io >>> 20) | 0));
      var i4 = (31 & ((io >>> 15) | 0));
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i6 < this.data6$7.u.length) ? this.data6$7.get(i6).get(i5).get(i4).get(i3).get(i2).get(i1) : ((i5 < this.suffix5$7.u.length) ? this.suffix5$7.get(i5).get(i4).get(i3).get(i2).get(i1) : ((i4 < this.suffix4$7.u.length) ? this.suffix4$7.get(i4).get(i3).get(i2).get(i1) : ((i3 < this.suffix3$7.u.length) ? this.suffix3$7.get(i3).get(i2).get(i1) : ((i2 < this.suffix2$7.u.length) ? this.suffix2$7.get(i2).get(i1) : this.suffix1$6.get(i1))))))
    } else if ((index >= this.len1234$7)) {
      var io$2 = ((index - this.len1234$7) | 0);
      return this.prefix5$7.get(((io$2 >>> 20) | 0)).get((31 & ((io$2 >>> 15) | 0))).get((31 & ((io$2 >>> 10) | 0))).get((31 & ((io$2 >>> 5) | 0))).get((31 & io$2))
    } else if ((index >= this.len123$7)) {
      var io$3 = ((index - this.len123$7) | 0);
      return this.prefix4$7.get(((io$3 >>> 15) | 0)).get((31 & ((io$3 >>> 10) | 0))).get((31 & ((io$3 >>> 5) | 0))).get((31 & io$3))
    } else if ((index >= this.len12$7)) {
      var io$4 = ((index - this.len12$7) | 0);
      return this.prefix3$7.get(((io$4 >>> 10) | 0)).get((31 & ((io$4 >>> 5) | 0))).get((31 & io$4))
    } else if ((index >= this.len1$7)) {
      var io$5 = ((index - this.len1$7) | 0);
      return this.prefix2$7.get(((io$5 >>> 5) | 0)).get((31 & io$5))
    } else {
      return this.prefix1$4.get(index)
    }
  } else {
    throw this.ioob__I__jl_IndexOutOfBoundsException(index)
  }
});
$c_sci_Vector6.prototype.init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__I__AAAAAAO__AAAAAO__AAAAO__AAAO__AAO__AO__I = (function(_prefix1, len1, prefix2, len12, prefix3, len123, prefix4, len1234, prefix5, len12345, data6, suffix5, suffix4, suffix3, suffix2, _suffix1, _length0) {
  this.len1$7 = len1;
  this.prefix2$7 = prefix2;
  this.len12$7 = len12;
  this.prefix3$7 = prefix3;
  this.len123$7 = len123;
  this.prefix4$7 = prefix4;
  this.len1234$7 = len1234;
  this.prefix5$7 = prefix5;
  this.len12345$7 = len12345;
  this.data6$7 = data6;
  this.suffix5$7 = suffix5;
  this.suffix4$7 = suffix4;
  this.suffix3$7 = suffix3;
  this.suffix2$7 = suffix2;
  $c_sci_BigVector.prototype.init___AO__AO__I.call(this, _prefix1, _suffix1, _length0);
  return this
});
$c_sci_Vector6.prototype.vectorSliceCount__I = (function() {
  return 11
});
$c_sci_Vector6.prototype.slice0__I__I__sci_Vector = (function(lo, hi) {
  var b = new $c_sci_VectorSliceBuilder().init___I__I(lo, hi);
  b.consider__I__AO__V(1, this.prefix1$4);
  b.consider__I__AO__V(2, this.prefix2$7);
  b.consider__I__AO__V(3, this.prefix3$7);
  b.consider__I__AO__V(4, this.prefix4$7);
  b.consider__I__AO__V(5, this.prefix5$7);
  b.consider__I__AO__V(6, this.data6$7);
  b.consider__I__AO__V(5, this.suffix5$7);
  b.consider__I__AO__V(4, this.suffix4$7);
  b.consider__I__AO__V(3, this.suffix3$7);
  b.consider__I__AO__V(2, this.suffix2$7);
  b.consider__I__AO__V(1, this.suffix1$6);
  return b.result__sci_Vector()
});
$c_sci_Vector6.prototype.tail__sci_Vector = (function() {
  if ((this.len1$7 > 1)) {
    var a = this.prefix1$4;
    var x$1 = $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a, 1, a.u.length);
    var x$2 = (((-1) + this.len1$7) | 0);
    var x$3 = (((-1) + this.len12$7) | 0);
    var x$4 = (((-1) + this.len123$7) | 0);
    var x$5 = (((-1) + this.len1234$7) | 0);
    var x$6 = (((-1) + this.len12345$7) | 0);
    var x$7 = (((-1) + this.length0$6) | 0);
    var x$8 = this.prefix2$7;
    var x$9 = this.prefix3$7;
    var x$10 = this.prefix4$7;
    var x$11 = this.prefix5$7;
    var x$12 = this.data6$7;
    var x$13 = this.suffix5$7;
    var x$14 = this.suffix4$7;
    var x$15 = this.suffix3$7;
    var x$16 = this.suffix2$7;
    var x$17 = this.suffix1$6;
    return new $c_sci_Vector6().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__I__AAAAAAO__AAAAAO__AAAAO__AAAO__AAO__AO__I(x$1, x$2, x$8, x$3, x$9, x$4, x$10, x$5, x$11, x$6, x$12, x$13, x$14, x$15, x$16, x$17, x$7)
  } else {
    return this.slice0__I__I__sci_Vector(1, this.length0$6)
  }
});
$c_sci_Vector6.prototype.prepended__O__O = (function(elem) {
  return this.prepended__O__sci_Vector(elem)
});
$c_sci_Vector6.prototype.prepended__O__sci_Vector = (function(elem) {
  if ((this.len1$7 < 32)) {
    var x$1 = $m_sci_VectorStatics$().copyPrepend1__O__AO__AO(elem, this.prefix1$4);
    var x$2 = ((1 + this.len1$7) | 0);
    var x$3 = ((1 + this.len12$7) | 0);
    var x$4 = ((1 + this.len123$7) | 0);
    var x$5 = ((1 + this.len1234$7) | 0);
    var x$6 = ((1 + this.len12345$7) | 0);
    var x$7 = ((1 + this.length0$6) | 0);
    var x$8 = this.prefix2$7;
    var x$9 = this.prefix3$7;
    var x$10 = this.prefix4$7;
    var x$11 = this.prefix5$7;
    var x$12 = this.data6$7;
    var x$13 = this.suffix5$7;
    var x$14 = this.suffix4$7;
    var x$15 = this.suffix3$7;
    var x$16 = this.suffix2$7;
    var x$17 = this.suffix1$6;
    return new $c_sci_Vector6().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__I__AAAAAAO__AAAAAO__AAAAO__AAAO__AAO__AO__I(x$1, x$2, x$8, x$3, x$9, x$4, x$10, x$5, x$11, x$6, x$12, x$13, x$14, x$15, x$16, x$17, x$7)
  } else if ((this.len12$7 < 1024)) {
    var a = $newArrayObject($d_O.getArrayOf(), [1]);
    a.set(0, elem);
    var x$20 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), 2);
    var x$21 = ((1 + this.len12$7) | 0);
    var x$22 = ((1 + this.len123$7) | 0);
    var x$23 = ((1 + this.len1234$7) | 0);
    var x$24 = ((1 + this.len12345$7) | 0);
    var x$25 = ((1 + this.length0$6) | 0);
    var x$26 = this.prefix3$7;
    var x$27 = this.prefix4$7;
    var x$28 = this.prefix5$7;
    var x$29 = this.data6$7;
    var x$30 = this.suffix5$7;
    var x$31 = this.suffix4$7;
    var x$32 = this.suffix3$7;
    var x$33 = this.suffix2$7;
    var x$34 = this.suffix1$6;
    return new $c_sci_Vector6().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__I__AAAAAAO__AAAAAO__AAAAO__AAAO__AAO__AO__I(a, 1, x$20, x$21, x$26, x$22, x$27, x$23, x$28, x$24, x$29, x$30, x$31, x$32, x$33, x$34, x$25)
  } else if ((this.len123$7 < 32768)) {
    var a$1 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$1.set(0, elem);
    var x$37 = $m_sci_VectorStatics$().empty2$1;
    var x$39 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.prefix3$7), 3);
    var x$40 = ((1 + this.len123$7) | 0);
    var x$41 = ((1 + this.len1234$7) | 0);
    var x$42 = ((1 + this.len12345$7) | 0);
    var x$43 = ((1 + this.length0$6) | 0);
    var x$44 = this.prefix4$7;
    var x$45 = this.prefix5$7;
    var x$46 = this.data6$7;
    var x$47 = this.suffix5$7;
    var x$48 = this.suffix4$7;
    var x$49 = this.suffix3$7;
    var x$50 = this.suffix2$7;
    var x$51 = this.suffix1$6;
    return new $c_sci_Vector6().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__I__AAAAAAO__AAAAAO__AAAAO__AAAO__AAO__AO__I(a$1, 1, x$37, 1, x$39, x$40, x$44, x$41, x$45, x$42, x$46, x$47, x$48, x$49, x$50, x$51, x$43)
  } else if ((this.len1234$7 < 1048576)) {
    var a$2 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$2.set(0, elem);
    var x$54 = $m_sci_VectorStatics$().empty2$1;
    var x$56 = $m_sci_VectorStatics$().empty3$1;
    var x$58 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.prefix3$7), this.prefix4$7), 4);
    var x$59 = ((1 + this.len1234$7) | 0);
    var x$60 = ((1 + this.len12345$7) | 0);
    var x$61 = ((1 + this.length0$6) | 0);
    var x$62 = this.prefix5$7;
    var x$63 = this.data6$7;
    var x$64 = this.suffix5$7;
    var x$65 = this.suffix4$7;
    var x$66 = this.suffix3$7;
    var x$67 = this.suffix2$7;
    var x$68 = this.suffix1$6;
    return new $c_sci_Vector6().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__I__AAAAAAO__AAAAAO__AAAAO__AAAO__AAO__AO__I(a$2, 1, x$54, 1, x$56, 1, x$58, x$59, x$62, x$60, x$63, x$64, x$65, x$66, x$67, x$68, x$61)
  } else if ((this.len12345$7 < 33554432)) {
    var a$3 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$3.set(0, elem);
    var x$71 = $m_sci_VectorStatics$().empty2$1;
    var x$73 = $m_sci_VectorStatics$().empty3$1;
    var x$75 = $m_sci_VectorStatics$().empty4$1;
    var x$77 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.prefix3$7), this.prefix4$7), this.prefix5$7), 5);
    var x$78 = ((1 + this.len12345$7) | 0);
    var x$79 = ((1 + this.length0$6) | 0);
    var x$80 = this.data6$7;
    var x$81 = this.suffix5$7;
    var x$82 = this.suffix4$7;
    var x$83 = this.suffix3$7;
    var x$84 = this.suffix2$7;
    var x$85 = this.suffix1$6;
    return new $c_sci_Vector6().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__I__AAAAAAO__AAAAAO__AAAAO__AAAO__AAO__AO__I(a$3, 1, x$71, 1, x$73, 1, x$75, 1, x$77, x$78, x$80, x$81, x$82, x$83, x$84, x$85, x$79)
  } else if ((this.data6$7.u.length < 62)) {
    var a$4 = $newArrayObject($d_O.getArrayOf(), [1]);
    a$4.set(0, elem);
    var x$88 = $m_sci_VectorStatics$().empty2$1;
    var x$90 = $m_sci_VectorStatics$().empty3$1;
    var x$92 = $m_sci_VectorStatics$().empty4$1;
    var x$94 = $m_sci_VectorStatics$().empty5$1;
    var x$96 = $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO(this.prefix1$4, this.prefix2$7), this.prefix3$7), this.prefix4$7), this.prefix5$7), this.data6$7), 6);
    var x$97 = ((1 + this.length0$6) | 0);
    var x$98 = this.suffix5$7;
    var x$99 = this.suffix4$7;
    var x$100 = this.suffix3$7;
    var x$101 = this.suffix2$7;
    var x$102 = this.suffix1$6;
    return new $c_sci_Vector6().init___AO__I__AAO__I__AAAO__I__AAAAO__I__AAAAAO__I__AAAAAAO__AAAAAO__AAAAO__AAAO__AAO__AO__I(a$4, 1, x$88, 1, x$90, 1, x$92, 1, x$94, 1, x$96, x$98, x$99, x$100, x$101, x$102, x$97)
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
});
$c_sci_Vector6.prototype.tail__O = (function() {
  return this.tail__sci_Vector()
});
$c_sci_Vector6.prototype.vectorSlice__I__AO = (function(idx) {
  switch (idx) {
    case 0: {
      return this.prefix1$4;
      break
    }
    case 1: {
      return this.prefix2$7;
      break
    }
    case 2: {
      return this.prefix3$7;
      break
    }
    case 3: {
      return this.prefix4$7;
      break
    }
    case 4: {
      return this.prefix5$7;
      break
    }
    case 5: {
      return this.data6$7;
      break
    }
    case 6: {
      return this.suffix5$7;
      break
    }
    case 7: {
      return this.suffix4$7;
      break
    }
    case 8: {
      return this.suffix3$7;
      break
    }
    case 9: {
      return this.suffix2$7;
      break
    }
    case 10: {
      return this.suffix1$6;
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(idx)
    }
  }
});
function $as_sci_Vector6(obj) {
  return (((obj instanceof $c_sci_Vector6) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector6"))
}
function $isArrayOf_sci_Vector6(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector6)))
}
function $asArrayOf_sci_Vector6(obj, depth) {
  return (($isArrayOf_sci_Vector6(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector6;", depth))
}
var $d_sci_Vector6 = new $TypeData().initClass({
  sci_Vector6: 0
}, false, "scala.collection.immutable.Vector6", {
  sci_Vector6: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  sci_IndexedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  scg_DefaultSerializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector6.prototype.$classData = $d_sci_Vector6;
/** @constructor */
function $c_scm_StringBuilder() {
  $c_scm_AbstractSeq.call(this);
  this.underlying$4 = null
}
$c_scm_StringBuilder.prototype = new $h_scm_AbstractSeq();
$c_scm_StringBuilder.prototype.constructor = $c_scm_StringBuilder;
/** @constructor */
function $h_scm_StringBuilder() {
  /*<skip>*/
}
$h_scm_StringBuilder.prototype = $c_scm_StringBuilder.prototype;
$c_scm_StringBuilder.prototype.init___ = (function() {
  $c_scm_StringBuilder.prototype.init___jl_StringBuilder.call(this, new $c_jl_StringBuilder().init___());
  return this
});
$c_scm_StringBuilder.prototype.head__O = (function() {
  var c = this.underlying$4.charAt__I__C(0);
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.apply__I__O = (function(i) {
  var c = this.underlying$4.charAt__I__C(i);
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.lengthCompare__I__I = (function(len) {
  var x = this.underlying$4.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1))
});
$c_scm_StringBuilder.prototype.apply__O__O = (function(v1) {
  var i = $uI(v1);
  var c = this.underlying$4.charAt__I__C(i);
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  return this.underlying$4.substring__I__I__T(start, end)
});
$c_scm_StringBuilder.prototype.appendAll__sc_IterableOnce__scm_StringBuilder = (function(xs) {
  if ((xs instanceof $c_sci_WrappedString)) {
    var x2 = $as_sci_WrappedString(xs);
    var this$3 = this.underlying$4;
    $m_sci_WrappedString$();
    var str = x2.scala$collection$immutable$WrappedString$$self$4;
    this$3.java$lang$StringBuilder$$content$f = (("" + this$3.java$lang$StringBuilder$$content$f) + str)
  } else if ((xs instanceof $c_scm_ArraySeq$ofChar)) {
    var x3 = $as_scm_ArraySeq$ofChar(xs);
    this.underlying$4.append__AC__jl_StringBuilder(x3.array__AC())
  } else if ((xs instanceof $c_scm_StringBuilder)) {
    var x4 = $as_scm_StringBuilder(xs);
    var this$4 = this.underlying$4;
    var s = x4.underlying$4;
    this$4.java$lang$StringBuilder$$content$f = (("" + this$4.java$lang$StringBuilder$$content$f) + s)
  } else {
    var ks = xs.knownSize__I();
    if ((ks !== 0)) {
      var b = this.underlying$4;
      if ((ks > 0)) {
        b.length__I()
      };
      var it = xs.iterator__sc_Iterator();
      while (it.hasNext__Z()) {
        var c = it.next__O();
        if ((c === null)) {
          var jsx$1 = 0
        } else {
          var this$6 = $as_jl_Character(c);
          var jsx$1 = this$6.value$1
        };
        b.append__C__jl_StringBuilder(jsx$1)
      }
    }
  };
  return this
});
$c_scm_StringBuilder.prototype.fromSpecific__sc_IterableOnce__O = (function(coll) {
  return new $c_scm_StringBuilder().init___().appendAll__sc_IterableOnce__scm_StringBuilder(coll)
});
$c_scm_StringBuilder.prototype.toString__T = (function() {
  return this.underlying$4.java$lang$StringBuilder$$content$f
});
$c_scm_StringBuilder.prototype.result__O = (function() {
  return this.underlying$4.java$lang$StringBuilder$$content$f
});
$c_scm_StringBuilder.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new $c_sc_IndexedSeqView$Id().init___sc_IndexedSeqOps(this);
  return new $c_sc_IndexedSeqView$IndexedSeqViewIterator().init___sc_IndexedSeqView(this$1)
});
$c_scm_StringBuilder.prototype.length__I = (function() {
  return this.underlying$4.length__I()
});
$c_scm_StringBuilder.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_scm_IndexedSeq$()
});
$c_scm_StringBuilder.prototype.drop__I__O = (function(n) {
  return $f_sc_IndexedSeqOps__drop__I__O(this, n)
});
$c_scm_StringBuilder.prototype.addAll__sc_IterableOnce__scm_Growable = (function(xs) {
  return $f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this, xs)
});
$c_scm_StringBuilder.prototype.init___jl_StringBuilder = (function(underlying) {
  this.underlying$4 = underlying;
  return this
});
$c_scm_StringBuilder.prototype.addOne__C__scm_StringBuilder = (function(x) {
  this.underlying$4.append__C__jl_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.addOne__O__scm_Growable = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.addOne__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_StringBuilder.prototype.knownSize__I = (function() {
  return this.underlying$4.length__I()
});
$c_scm_StringBuilder.prototype.fromSpecific__sc_IterableOnce__sc_IterableOps = (function(coll) {
  return new $c_scm_StringBuilder().init___().appendAll__sc_IterableOnce__scm_StringBuilder(coll)
});
$c_scm_StringBuilder.prototype.stringPrefix__T = (function() {
  return "IndexedSeq"
});
function $as_scm_StringBuilder(obj) {
  return (((obj instanceof $c_scm_StringBuilder) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.StringBuilder"))
}
function $isArrayOf_scm_StringBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_StringBuilder)))
}
function $asArrayOf_scm_StringBuilder(obj, depth) {
  return (($isArrayOf_scm_StringBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.StringBuilder;", depth))
}
var $d_scm_StringBuilder = new $TypeData().initClass({
  scm_StringBuilder: 0
}, false, "scala.collection.mutable.StringBuilder", {
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_SeqOps: 1,
  scm_Cloneable: 1,
  jl_Cloneable: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scm_Growable: 1,
  scm_Clearable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  scm_IndexedSeqOps: 1,
  jl_CharSequence: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder.prototype.$classData = $d_scm_StringBuilder;
/** @constructor */
function $c_scm_ListBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.first$5 = null;
  this.last0$5 = null;
  this.aliased$5 = false;
  this.len$5 = 0
}
$c_scm_ListBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ListBuffer.prototype.constructor = $c_scm_ListBuffer;
/** @constructor */
function $h_scm_ListBuffer() {
  /*<skip>*/
}
$h_scm_ListBuffer.prototype = $c_scm_ListBuffer.prototype;
$c_scm_ListBuffer.prototype.init___ = (function() {
  this.first$5 = $m_sci_Nil$();
  this.last0$5 = null;
  this.aliased$5 = false;
  this.len$5 = 0;
  return this
});
$c_scm_ListBuffer.prototype.apply__I__O = (function(i) {
  var this$1 = this.first$5;
  return $f_sc_LinearSeqOps__apply__I__O(this$1, i)
});
$c_scm_ListBuffer.prototype.apply__O__O = (function(v1) {
  var i = $uI(v1);
  var this$1 = this.first$5;
  return $f_sc_LinearSeqOps__apply__I__O(this$1, i)
});
$c_scm_ListBuffer.prototype.isEmpty__Z = (function() {
  return (this.len$5 === 0)
});
$c_scm_ListBuffer.prototype.toList__sci_List = (function() {
  this.aliased$5 = $f_sc_IterableOnceOps__nonEmpty__Z(this);
  return this.first$5
});
$c_scm_ListBuffer.prototype.addOne__O__scm_ListBuffer = (function(elem) {
  this.ensureUnaliased__p5__V();
  var last1 = new $c_sci_$colon$colon().init___O__sci_List(elem, $m_sci_Nil$());
  if ((this.len$5 === 0)) {
    this.first$5 = last1
  } else {
    this.last0$5.next$5 = last1
  };
  this.last0$5 = last1;
  this.len$5 = ((1 + this.len$5) | 0);
  return this
});
$c_scm_ListBuffer.prototype.ensureUnaliased__p5__V = (function() {
  if (this.aliased$5) {
    this.copyElems__p5__V()
  }
});
$c_scm_ListBuffer.prototype.copyElems__p5__V = (function() {
  var this$2 = new $c_scm_ListBuffer().init___();
  var buf = this$2.addAll__sc_IterableOnce__scm_ListBuffer(this);
  this.first$5 = buf.first$5;
  this.last0$5 = buf.last0$5;
  this.aliased$5 = false
});
$c_scm_ListBuffer.prototype.result__O = (function() {
  return this.toList__sci_List()
});
$c_scm_ListBuffer.prototype.iterator__sc_Iterator = (function() {
  return this.first$5.iterator__sc_Iterator()
});
$c_scm_ListBuffer.prototype.addAll__sc_IterableOnce__scm_ListBuffer = (function(xs) {
  var it = xs.iterator__sc_Iterator();
  if (it.hasNext__Z()) {
    this.ensureUnaliased__p5__V();
    var last1 = new $c_sci_$colon$colon().init___O__sci_List(it.next__O(), $m_sci_Nil$());
    if ((this.len$5 === 0)) {
      this.first$5 = last1
    } else {
      this.last0$5.next$5 = last1
    };
    this.last0$5 = last1;
    this.len$5 = ((1 + this.len$5) | 0);
    while (it.hasNext__Z()) {
      var last1$2 = new $c_sci_$colon$colon().init___O__sci_List(it.next__O(), $m_sci_Nil$());
      this.last0$5.next$5 = last1$2;
      this.last0$5 = last1$2;
      this.len$5 = ((1 + this.len$5) | 0)
    }
  };
  return this
});
$c_scm_ListBuffer.prototype.length__I = (function() {
  return this.len$5
});
$c_scm_ListBuffer.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_scm_ListBuffer$()
});
$c_scm_ListBuffer.prototype.addAll__sc_IterableOnce__scm_Growable = (function(xs) {
  return this.addAll__sc_IterableOnce__scm_ListBuffer(xs)
});
$c_scm_ListBuffer.prototype.addOne__O__scm_Growable = (function(elem) {
  return this.addOne__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_ListBuffer.prototype.knownSize__I = (function() {
  return this.len$5
});
$c_scm_ListBuffer.prototype.iterableFactory__sc_SeqFactory = (function() {
  return $m_scm_ListBuffer$()
});
$c_scm_ListBuffer.prototype.stringPrefix__T = (function() {
  return "ListBuffer"
});
function $as_scm_ListBuffer(obj) {
  return (((obj instanceof $c_scm_ListBuffer) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ListBuffer"))
}
function $isArrayOf_scm_ListBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ListBuffer)))
}
function $asArrayOf_scm_ListBuffer(obj, depth) {
  return (($isArrayOf_scm_ListBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ListBuffer;", depth))
}
var $d_scm_ListBuffer = new $TypeData().initClass({
  scm_ListBuffer: 0
}, false, "scala.collection.mutable.ListBuffer", {
  scm_ListBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_SeqOps: 1,
  scm_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_Growable: 1,
  scm_Clearable: 1,
  scm_Shrinkable: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_DefaultSerializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer.prototype.$classData = $d_scm_ListBuffer;
/** @constructor */
function $c_scm_ArrayBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.array$5 = null;
  this.size0$5 = 0
}
$c_scm_ArrayBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ArrayBuffer.prototype.constructor = $c_scm_ArrayBuffer;
/** @constructor */
function $h_scm_ArrayBuffer() {
  /*<skip>*/
}
$h_scm_ArrayBuffer.prototype = $c_scm_ArrayBuffer.prototype;
$c_scm_ArrayBuffer.prototype.init___ = (function() {
  $c_scm_ArrayBuffer.prototype.init___AO__I.call(this, $newArrayObject($d_O.getArrayOf(), [16]), 0);
  return this
});
$c_scm_ArrayBuffer.prototype.head__O = (function() {
  return this.apply__I__O(0)
});
$c_scm_ArrayBuffer.prototype.apply__I__O = (function(n) {
  var hi = ((1 + n) | 0);
  if ((n < 0)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T((((n + " is out of bounds (min 0, max ") + (((-1) + this.size0$5) | 0)) + ")"))
  };
  if ((hi > this.size0$5)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T((((hi + " is out of bounds (min 0, max ") + (((-1) + this.size0$5) | 0)) + ")"))
  };
  return this.array$5.get(n)
});
$c_scm_ArrayBuffer.prototype.lengthCompare__I__I = (function(len) {
  var x = this.size0$5;
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1))
});
$c_scm_ArrayBuffer.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_scm_ArrayBuffer.prototype.update__I__O__V = (function(index, elem) {
  var hi = ((1 + index) | 0);
  if ((index < 0)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T((((index + " is out of bounds (min 0, max ") + (((-1) + this.size0$5) | 0)) + ")"))
  };
  if ((hi > this.size0$5)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T((((hi + " is out of bounds (min 0, max ") + (((-1) + this.size0$5) | 0)) + ")"))
  };
  this.array$5.set(index, elem)
});
$c_scm_ArrayBuffer.prototype.ensureSize__I__V = (function(n) {
  this.array$5 = $m_scm_ArrayBuffer$().scala$collection$mutable$ArrayBuffer$$ensureSize__AO__I__I__AO(this.array$5, this.size0$5, n)
});
$c_scm_ArrayBuffer.prototype.addAll__sc_IterableOnce__scm_ArrayBuffer = (function(elems) {
  if ((elems instanceof $c_scm_ArrayBuffer)) {
    var x2 = $as_scm_ArrayBuffer(elems);
    this.ensureSize__I__V(((this.size0$5 + x2.size0$5) | 0));
    $m_s_Array$().copy__O__I__O__I__I__V(x2.array$5, 0, this.array$5, this.size0$5, x2.size0$5);
    this.size0$5 = ((this.size0$5 + x2.size0$5) | 0)
  } else {
    $f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this, elems)
  };
  return this
});
$c_scm_ArrayBuffer.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new $c_scm_ArrayBufferView().init___AO__I(this.array$5, this.size0$5);
  return new $c_sc_IndexedSeqView$IndexedSeqViewIterator().init___sc_IndexedSeqView(this$1)
});
$c_scm_ArrayBuffer.prototype.length__I = (function() {
  return this.size0$5
});
$c_scm_ArrayBuffer.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_scm_ArrayBuffer$()
});
$c_scm_ArrayBuffer.prototype.drop__I__O = (function(n) {
  return $f_sc_IndexedSeqOps__drop__I__O(this, n)
});
$c_scm_ArrayBuffer.prototype.addOne__O__scm_ArrayBuffer = (function(elem) {
  var i = this.size0$5;
  this.ensureSize__I__V(((1 + this.size0$5) | 0));
  this.size0$5 = ((1 + this.size0$5) | 0);
  this.update__I__O__V(i, elem);
  return this
});
$c_scm_ArrayBuffer.prototype.addAll__sc_IterableOnce__scm_Growable = (function(xs) {
  return this.addAll__sc_IterableOnce__scm_ArrayBuffer(xs)
});
$c_scm_ArrayBuffer.prototype.addOne__O__scm_Growable = (function(elem) {
  return this.addOne__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.knownSize__I = (function() {
  return this.size0$5
});
$c_scm_ArrayBuffer.prototype.iterableFactory__sc_SeqFactory = (function() {
  return $m_scm_ArrayBuffer$()
});
$c_scm_ArrayBuffer.prototype.init___AO__I = (function(initialElements, initialSize) {
  this.array$5 = initialElements;
  this.size0$5 = initialSize;
  return this
});
$c_scm_ArrayBuffer.prototype.stringPrefix__T = (function() {
  return "ArrayBuffer"
});
function $as_scm_ArrayBuffer(obj) {
  return (((obj instanceof $c_scm_ArrayBuffer) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuffer"))
}
function $isArrayOf_scm_ArrayBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuffer)))
}
function $asArrayOf_scm_ArrayBuffer(obj, depth) {
  return (($isArrayOf_scm_ArrayBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuffer;", depth))
}
var $d_scm_ArrayBuffer = new $TypeData().initClass({
  scm_ArrayBuffer: 0
}, false, "scala.collection.mutable.ArrayBuffer", {
  scm_ArrayBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_SeqOps: 1,
  scm_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_Growable: 1,
  scm_Clearable: 1,
  scm_Shrinkable: 1,
  scm_IndexedBuffer: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  scm_IndexedSeqOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  scg_DefaultSerializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer.prototype.$classData = $d_scm_ArrayBuffer;
/** @constructor */
function $c_sjs_js_WrappedArray() {
  $c_scm_AbstractBuffer.call(this);
  this.array$5 = null
}
$c_sjs_js_WrappedArray.prototype = new $h_scm_AbstractBuffer();
$c_sjs_js_WrappedArray.prototype.constructor = $c_sjs_js_WrappedArray;
/** @constructor */
function $h_sjs_js_WrappedArray() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray.prototype = $c_sjs_js_WrappedArray.prototype;
$c_sjs_js_WrappedArray.prototype.head__O = (function() {
  return this.array$5[0]
});
$c_sjs_js_WrappedArray.prototype.init___ = (function() {
  $c_sjs_js_WrappedArray.prototype.init___sjs_js_Array.call(this, []);
  return this
});
$c_sjs_js_WrappedArray.prototype.apply__I__O = (function(index) {
  return this.array$5[index]
});
$c_sjs_js_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  var x = $uI(this.array$5.length);
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1))
});
$c_sjs_js_WrappedArray.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.array$5[index]
});
$c_sjs_js_WrappedArray.prototype.result__O = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new $c_sc_IndexedSeqView$Id().init___sc_IndexedSeqOps(this);
  return new $c_sc_IndexedSeqView$IndexedSeqViewIterator().init___sc_IndexedSeqView(this$1)
});
$c_sjs_js_WrappedArray.prototype.length__I = (function() {
  return $uI(this.array$5.length)
});
$c_sjs_js_WrappedArray.prototype.iterableFactory__sc_IterableFactory = (function() {
  return $m_sjs_js_WrappedArray$()
});
$c_sjs_js_WrappedArray.prototype.drop__I__O = (function(n) {
  return $f_sc_IndexedSeqOps__drop__I__O(this, n)
});
$c_sjs_js_WrappedArray.prototype.addOne__O__scm_Growable = (function(elem) {
  this.array$5.push(elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sjs_js_WrappedArray.prototype.className__T = (function() {
  return "WrappedArray"
});
$c_sjs_js_WrappedArray.prototype.init___sjs_js_Array = (function(array) {
  this.array$5 = array;
  return this
});
$c_sjs_js_WrappedArray.prototype.knownSize__I = (function() {
  return $uI(this.array$5.length)
});
$c_sjs_js_WrappedArray.prototype.iterableFactory__sc_SeqFactory = (function() {
  return $m_sjs_js_WrappedArray$()
});
$c_sjs_js_WrappedArray.prototype.stringPrefix__T = (function() {
  return "IndexedSeq"
});
function $as_sjs_js_WrappedArray(obj) {
  return (((obj instanceof $c_sjs_js_WrappedArray) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.WrappedArray"))
}
function $isArrayOf_sjs_js_WrappedArray(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_WrappedArray)))
}
function $asArrayOf_sjs_js_WrappedArray(obj, depth) {
  return (($isArrayOf_sjs_js_WrappedArray(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.WrappedArray;", depth))
}
var $d_sjs_js_WrappedArray = new $TypeData().initClass({
  sjs_js_WrappedArray: 0
}, false, "scala.scalajs.js.WrappedArray", {
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  O: 1,
  sc_Iterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOps: 1,
  sc_IterableOnceOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_SeqOps: 1,
  scm_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_Growable: 1,
  scm_Clearable: 1,
  scm_Shrinkable: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  scm_IndexedSeqOps: 1,
  scm_IndexedBuffer: 1,
  scm_Builder: 1,
  Ljava_io_Serializable: 1
});
$c_sjs_js_WrappedArray.prototype.$classData = $d_sjs_js_WrappedArray;
$e.MyTalk = $m_LMyTalk$;
$m_LMyTalk$().main__V();
}).call(this);
//# sourceMappingURL=mytalk-fastopt.js.map
