var KM =    //全局对象
{
	EventUtil:    //通用事件方法对象  KM.EventUtil
	{
		addHandler: function(element, type, handler){  //传入元素，事件名和事件处理函数
			if(element.addEventListener){  //DOM2级添加事件处理程序
				element.addEventListener(type, handler, false);
			} else if(element.attachEvent) {	//IE添加事件处理程序
				element.attachEvent("on" + type, handler);
			} else {												//DOM0级添加事件处理程序
				element["on" + type] = handler;
			}
		},
		getEvent: function(event) {  //用于在事件处理函数中从传入的event对象得到有效的event对象
			return event ? event : window.event;
		},
		getTarget: function(event) {   //用于在事件处理函数中从event对象中正确地得到target
			return event.target || event.srcElement;
		},
		preventDefault: function(event) {		//在不同的浏览器中实现preventDefault方法
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
		stopPropagation: function(event) {		//在不同的浏览器中实现stopPropagation方法
			if(event.stopPropagation) {
				event.stopPropagation();
			} else {
				event.cancelBubble = true;
			}
		}
	}
};