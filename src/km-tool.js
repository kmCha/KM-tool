var KM = function(){		//返回全局对象

	var inKM =				//要返回的全局对象
	{				//不需要访问私有属性的方法放在字面量中
		throttle: function(method, context) {							//KM.throttle(),节流函数，通常用在resize之类的会连续触发的事件的事件处理函数中
      return function() {
				clearTimeout(method.tId);
				method.tId = setTimeout(function(){
					method.call(context);
				}, 100);
			};
		},

		isFunction: function(fn) {												//KM.isFunction(fn),跨浏览器判断fn是否是function
			return Object.prototype.toString.call(fn) === "[object Function]";
		},

		contains: function(refNode, otherNode) {					//KM.contains(ref, other), 跨浏览器判断refNode是否包含otherNode
			if(typeof refNode.contains === "function") {   // 支持contains()方法
				return refNode.contains(otherNode);
			}
			else if (typeof refNode.compareDocumentPosition === "function") {   // 支持compareDocumentPosition()方法
				return !!(refNode.compareDocumentPosition(otherNode) & 16); // 按位与 位掩码
			}
			else {										// 都不支持，递归遍历父节点
				var node = otherNode.parentNode;
				do {
					if(node === refNode) {
						return true;
					}
					else{
						node = node.parentNode;
					}
				} while(node !== null);
			}
		},

		EventUtil:    //通用事件方法对象  KM.EventUtil
		{
			fixEvent: function(event) {									//event = KM.EventUtil.fixEvent(e)，用于创建浏览器通用event对象，并附上各种属性方法
				function returnTrue() {
          return true;
        }
        function returnFalse() {
          return false;
        }

        if (!event || !event.stopPropagation) {
          var old = event || window.event;				//旧版IE的event对象是window的属性

          // 复制老的event对象然后添加想要的功能
          event = {};

          for (var prop in old) {                 //遍历老事件对象的属性赋值给新对象
            event[prop] = old[prop];
          }

          // 触发事件的对象
          if (!event.target) {
            event.target = event.srcElement || document;
          }

          // 事件有关对象
          event.relatedTarget = event.fromElement === event.target ?
              event.toElement :
              event.fromElement;

          // 阻止浏览器默认行为
          event.preventDefault = function () {
            event.returnValue = false;
            event.isDefaultPrevented = returnTrue;
          };

          event.isDefaultPrevented = returnFalse;   //event.isDefaultPrevented返回是否阻止了默认行为

          // 阻止事件冒泡
          event.stopPropagation = function () {
            event.cancelBubble = true;
            event.isPropagationStopped = returnTrue;
          };

          event.isPropagationStopped = returnFalse; //event.isPropagationStopped返回是否阻止了冒泡

          // 阻止事件冒泡并且阻止其他的事件处理程序执行
          event.stopImmediatePropagation = function () {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
          };

          event.isImmediatePropagationStopped = returnFalse;

          // 返回鼠标的位置
          if (event.clientX !== null) {
            var doc = document.documentElement, body = document.body;

            event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
                (doc && doc.scrollTop || body && body.scrollTop || 0) -
                (doc && doc.clientTop || body && body.clientTop || 0);
          }

          // 返回键盘按键值
          event.which = event.charCode || event.keyCode;

          // 返回鼠标的按键值:
          // 0 == 左键; 1 == 中键; 2 == 右键
          if (event.button !== null) {
            event.button = (event.button & 1 ? 0 :
                (event.button & 4 ? 1 :
                    (event.button & 2 ? 2 : 0)));
          }
        }

        return event;													//返回通用event对象
			},
			clearResource: function(element, type) {
			//解除事件处理程序绑定之后用于清除空的对象数组等资源
				function isEmpty(obj) {		//内部函数用来判断一个对象是否为空
					for(var prop in obj) {
						return false;
					}
					return true;
				}

				var data = KM.getData(element);

				if(data.handlers[type].length === 0) {		//判断handlers中对应type的事件处理程序数组是否为空，为空则清除数组和解除绑定此type下的调度函数
					delete data.handlers[type];
					if(document.removeEventListener) {
						element.removeEventListener(type, data.dispatcher, false);
					}
					else if(document.detachEvent) {
						element.detachEvent("on" + type, data.dispatcher);
					}
				}

				if(isEmpty(data.handlers)) {			//判断handlers对象是否为空，为空则说明该元素上没有绑定任何事件处理函数
					delete data.handlers;
					delete data.dispatcher;
				}

				if(isEmpty(data)) {				//判断data是否为空，为空说明此元素没有绑定任何数据
					KM.removeData(element);
				}
			},
			triggerEvent: function(element, event) {								//在指定元素上触发冒泡事件
			//传入的event可以是event对象，也可以是字符串（比如说自定义事件）
				var elementData = KM.getData(element),								//获取绑定在元素上的信息（主要用来获取dispatcher调度函数）
						parent = element.parentNode || element.ownerDocument;	//得到元素的父节点(最后得到顶层的document)

				if(typeof event === "string") {												//如果传入的字符串就生成一个自定义event对象
					event = {type: event, target: element};
				}
				event = KM.EventUtil.fixEvent(event);

				if(elementData.dispatcher) {													//调用调度函数来执行对应event的事件处理程序
					elementData.dispatcher.call(element, event);
				}

				if (parent && !event.isPropagationStopped()) {        //确保父节点存在并且没有阻止事件冒泡，接着触发父节点上的事件
			    KM.EventUtil.triggerEvent(parent, event);
			  }

			  else if (!parent && !event.isDefaultPrevented()) {    //到了最顶层的document，确保浏览器默认行为没有被禁用，然后执行默认行为

			    var targetData = KM.getData(event.target);

			    if (event.target[event.type]) {                     //如果元素在该事件上有默认行为

			      targetData.disabled = true;                       //在执行默认行为之前禁用调度函数，因为会触发该事件

			      event.target[event.type]();                       //执行默认行为

			      targetData.disabled = false;                      //重新将调度函数设为可用
			    }
			  }
			}
		}
	};
	//下面是需要访问私有变量的方法和私有属性的定义

	//＊＊＊＊＊＊＊＊寄生组合继承中的原型继承部分＊＊＊＊＊＊＊＊
	var object = function(o) {    //私有方法，为inheritPrototype()方法提供前置函数
	//o为一个构造函数的prototype对象
		function F(){}				//构造函数为空因为只继承prototype中的属性和方法，实例属性用借用构造函数法
		F.prototype = o;
		return new F();				//返回prototype和o相同的实例，作为给子类继承的prototype
	};

	inKM.inheritPrototype = function(subType, superType) {  //KM.inheritPrototype(a,b)
	//用到object私有方法，只能用于寄生组合继承中的原型继承部分，还必须用到借用构造函数完成实例属性的继承
		var prototype = object(superType.prototype);
		prototype.constructor = subType;
		subType.prototype = prototype;
	};
	//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊

	//＊＊＊＊＊＊＊＊纪录DOM元素相关信息＊＊＊＊＊＊＊＊
	var cache = {},							//私有对象属性，存放元素的guid，每个guid对应的值为一个存放元素信息的对象
			guidCounter = 1,				//私有变量，为每个元素分配guid
			expando = "data-" + (new Date()).getTime();   //私有变量，为每个元素的自定义特性分配名字（根据创建的时间）

	inKM.getData = function(element) {		//KM.getData(elem)，公有方法，读取传入元素的信息
		var guid = element[expando];				//设置guid为元素对应expando属性的值（如果存在的话）
		if(!guid){													//如果guid不存在，即元素中没有expando属性
			guid = element[expando] = guidCounter++;
			cache[guid] = {};									//初始化缓存中对应元素guid的信息对象
		}
		return cache[guid];
	};

	inKM.removeData = function(element) {   //KM.removeData(elem)，公有方法，清除元素的绑定信息和存放guid的expando属性
		var guid = element[expando];
		if(!guid) {														//传入的元素本来就没绑定过信息，没有guid
			return;
		}
		delete cache[guid];
		try {
			delete element[expando];
		}
		catch (e) {
			if(element.removeAttribute) {
				element.removeAttribute(expando);
			}
		}
	};
	//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊

	//＊＊＊＊＊＊＊＊绑定事件处理程序＊＊＊＊＊＊＊＊
	var nextGuid = 1;    //私有变量，为事件处理程序提供guid

	inKM.EventUtil.addEventListener = function(element, type, handler) {  //KM.EventUtil.addEventListener(elem,type,fn)，公有方法
		var data = KM.getData(element);							//获取绑定在element身上的信息

		if(!data.dispatcher) {											//判断data中有没有调度函数，没有则创建
			data.disabled = false;										//禁用调度函数
			data.dispatcher = function(event) {
				if(data.disabled) return;
				event = KM.EventUtil.fixEvent(event);
				var handlers = data.handlers[event.type];
				if(handlers) {
					for(var n = 0; n < handlers.length; n++) {	//遍历执行所有data中对应type的事件处理程序
						handlers[n].call(element, event);					//并且指定执行上下文为element
					}
				}
			};
		}

		if(!data.handlers) {
			data.handlers = {};															//创建handlers对象，存放所有对应type的事件处理函数组成的数组
		}

		if(!data.handlers[type]) {
			data.handlers[type] = [];												//创建该type的事件处理程序数组
			if(document.addEventListener) {									//将调度函数添加为事件处理程序
				element.addEventListener(type, data.dispatcher, false);
			}
			else if(document.attachEvent) {
				element.attachEvent("on" + type, data.dispatcher);
			}
		}

		if(!handler.guid) {
			handler.guid = nextGuid++;											//给实际事件处理函数绑定guid
		}

		data.handlers[type].push(handler);								//将事件处理程序放进data中，dispatcher可以利用闭包访问最新的事件处理程序
	};
	//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊

	//＊＊＊＊＊＊＊＊解绑事件处理程序＊＊＊＊＊＊＊＊
	inKM.EventUtil.removeEventListener = function(element, type, handler) {		//根据传入的参数个数决定解绑方式
																							//只传入element则解绑元素上绑定的所有事件处理程序
																							//只传入element和type则解绑元素上该type的所有事件处理程序
		var data = KM.getData(element);

		if(!data.handlers) {		//传入的元素上没有绑定handlers信息，即没绑定过事件处理函数
			return;
		}

		var removeType = function(t) {		//内部函数，用于解绑元素上对应type的所有事件处理程序
			data.handlers[t] = [];					//将对应type的事件处理函数的数组设为空数组
			KM.EventUtil.clearResource(element, t);	//进行资源清理
		};

		if(!type) {												//只传入了element参数
			for(var t in data.handlers) {		//遍历handlers对象将所有值设为空数组然后进行资源清理
				removeType(t);
			}
			return;
		}

		var handlers = data.handlers[type];
		if(!handlers) {										//传入的元素里对应type没有绑定事件处理函数
			return;
		}

		if(!handler) {										//只传入了前两个参数
			removeType(type);
		}

		if(handler.guid) {								//传入的想要进行解绑的事件处理函数必须在之前设定过guid，即被绑定了之后才能解绑
			for(var i = 0; i < handlers.length; i++) {
				if(handlers[i].guid === handler.guid) {
					handlers.splice(i--, 1);
				}
			}
		}
		KM.EventUtil.clearResource(element, type);
	};
	//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊

	return inKM;
}();