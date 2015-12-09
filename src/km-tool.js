var KM = function(){		//返回全局对象
	var object = function(o) {    //私有方法，为inheritPrototype()方法提供前置函数
	//o为一个构造函数的prototype对象
		function F(){}				//构造函数为空因为只继承prototype中的属性和方法，实例属性用借用构造函数法
		F.prototype = o;
		return new F();				//返回prototype和o相同的实例，作为给子类继承的prototype
	};

	var inKM =				//要返回的全局对象
	{
		inheritPrototype: function(subType, superType) {  //KM.inheritPrototype(a,b)
		//用到object私有方法，只能用于寄生组合继承中的原型继承部分，还必须用到借用构造函数完成实例属性的继承
			var prototype = object(superType.prototype);
			prototype.constructor = subType;
			subType.prototype = prototype;
		},

		EventUtil:    //通用事件方法对象  KM.EventUtil
		{
			addHandler: function(element, type, handler){  //KM.EventUtil.addHandler(a,b,c)
			//传入元素，事件名和事件处理函数
				if(element.addEventListener){  //DOM2级添加事件处理程序
					element.addEventListener(type, handler, false);
				} else if(element.attachEvent) {	//IE添加事件处理程序
					element.attachEvent("on" + type, handler);
				} else {												//DOM0级添加事件处理程序
					element["on" + type] = handler;
				}
			},
			getEvent: function(event) {
			//用于在事件处理函数中从传入的event对象得到有效的event对象
				return event ? event : window.event;
			},
			getTarget: function(event) {
			//用于在事件处理函数中从event对象中正确地得到target
				return event.target || event.srcElement;
			},
			preventDefault: function(event) {
			//在不同的浏览器中实现preventDefault方法
				if(event.preventDefault){
					event.preventDefault();
				} else {
					event.returenValue = false;
				}
			},
			removeHandler: function(element, type, handler) {
				if(element.removeEventListener) {			//DOM2
					element.removeEventListener(type, handler, false);
				} else if(element.detachEvent){				//IE
					element.detachEvent("on" + type, handler);
				} else {															//DOM0
					element["on" + type] = null;
				}
			},
			stopPropagation: function(event) {
			//在不同的浏览器中实现stopPropagation方法
				if(event.stopPropagation) {
					event.stopPropagation();
				} else {
					event.cancelBubble = true;
				}
			},
			getRelatedTarget: function(event) {
			//用于取得在处理mouseover和mouseout事件的时候的相关对象
				if(event.relatedTarget){		//DOM
					return event.relatedTarget;
				} else if(event.toElement){  //IE mouseout
					return event.toElement;
				} else if(event.fromElement){  //IE mouseover
					return event.fromElement;
				} else {
					return null;
				}
			},
			getButton: function(event) {
			//用于取得event对象中代表哪个鼠标键被按下的button属性的值：0是左键，1是中键，2是右键
				if(document.implementation.hasFeature("MouseEvents", "2.0")) {  //DOM
					return event.button;
				} else {													//IE
					switch(event.button) {
						case 0:
						case 1:
						case 3:
						case 5:
						case 7:
							return 0;
						case 2:
						case 6:
							return 2;
						case 4:
							return 1;
					}
				}
			},
			getCharCode: function(event){
			//用于取得不同浏览器下对应于keypress事件的event对象中的charCode属性，返回按下字符键的ASCII码
				if(typeof event.charCode === "number") {		//支持charCode属性的浏览器
					return event.charCode;
				} else {																		//不支持charCode属性用keyCode代替
					return event.keyCode;
				}
			}
		}
	};
	return inKM;
}();