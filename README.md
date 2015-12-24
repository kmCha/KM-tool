# KM-tool
***
## My tool library
![](http://7xoxzw.com1.z0.glb.clouddn.com/15-12-8/33113146.jpg)

### Main function:
* prototype inherit part in parasitic combination inheritance
* cross browser add and delete event handler
* cross browser event object passed into event handler and its properties in different types of event


# Test

	// KM.throttle()
	describe("KM.throttle(method, context) method", function(){

		beforeEach(function() {
	    jasmine.clock().install();
	  });

		afterEach(function() {
	    jasmine.clock().uninstall();
	  });

		it("should return a function that will only invoke an input method when the time step is greater than 100ms", function(){
			var a = 0,
					increaseA = function() {
						a++;
					},
					throIncA = KM.throttle(increaseA);

			expect(throIncA instanceof Function).toBe(true);

			throIncA();
			jasmine.clock().tick(50);
			expect(a).toBe(0);
			throIncA();
			jasmine.clock().tick(80);
			expect(a).toBe(0);
			throIncA();
			jasmine.clock().tick(101);
			expect(a).toBe(1);
		});
	});

	// KM.getData()
	describe("KM.getData(element) method", function(){
		var domElem1 = document.createElement("div"),
				checkAttr = function(elem) {
					for(var prop in elem) {
						if(prop.indexOf("data-") >= 0){
							return true;
						}
					}
					return false;
				};
		it("can give an DIY property whose value is unique called guid to the input element", function(){
			expect(checkAttr(domElem1)).toBe(false);
			KM.getData(domElem1);
			expect(checkAttr(domElem1)).toBe(true);
		});

		it("can return an object containing the information about the element", function(){
			var data = KM.getData(domElem1);
			data.dispatcher = function(){};
			var data1 = KM.getData(domElem1);
			expect(data1 instanceof Object).toBe(true);
			expect(data1.dispatcher instanceof Function).toBe(true);
		});
	});

	// KM.removeData()
	describe("KM.removeData(element) method", function() {
		var domElem1 = document.createElement("div"),
				data = KM.getData(domElem1);

		data.dispatcher = function(){};

		it("can remove the data binded on the element", function(){
			expect(data.dispatcher instanceof Function).toBe(true);
			KM.removeData(domElem1);
			data = KM.getData(domElem1);
			expect(data.dispatcher).toBeUndefined();
		});
	});

	// KM.isFunction()
	describe("KM.isFunction(fn) method", function(){
		it("return ture if the input is a function no matter on what browser", function(){
			var func = function(){};
			expect(KM.isFunction(func)).toBe(true);
		});
	});

	//KM.EventUtil.addEventListener()
	describe("KM.EventUtil.addEventListener(element, type, handler) method", function(){

		it("can push the handler into the handler array which is KM.getData(element).handlers[type]", function(){
			var domElem = document.createElement("div"),
					type = "click",
					data = KM.getData(domElem);
			expect(data.handlers).toBeUndefined();
			KM.EventUtil.addEventListener(domElem, type, function(){});
			expect(data.handlers instanceof Object).toBe(true);
		});

		it("can add the dispatcher() function as a property of the element", function(){
			var domElem = document.createElement("div"),
					type = "click",
					data = KM.getData(domElem);
			expect(data.dispatcher).toBeUndefined();
			KM.EventUtil.addEventListener(domElem, type, function(){});
			expect(data.dispatcher instanceof Function).toBe(true);
		});

		it("can give the input handler a property called guid for tracking", function(){
			var domElem = document.createElement("div"),
					type = "click",
					data = KM.getData(domElem),
			    listener1 = function(){};

			expect(listener1.guid).toBeUndefined();

			KM.EventUtil.addEventListener(domElem, type, listener1);
			expect(typeof listener1.guid).toBe("number");
		});
	});

	// KM.EventUtil.removeEventListener()
	describe("KM.EventUtil.removeEventListener(element, type, handler) method", function(){

		it("can remove the handler from the array, which is KM.getData(element).handlers[type]", function(){
			var domElem = document.createElement("div"),
					type = "click",
					data = KM.getData(domElem),
					listener1 = function(){},
					listener2 = function(){};

			KM.EventUtil.addEventListener(domElem, type, listener1);
			KM.EventUtil.addEventListener(domElem, type, listener2);

			expect(data.handlers[type].length).toBe(2);
			KM.EventUtil.removeEventListener(domElem, type, listener1);
			expect(data.handlers[type].length).toBe(1);
		});
	});

	// KM.EventUtil.triggerEvent()
	describe("KM.EventUtil.triggerEvent(element, event) method", function(){
		var domElem = document.createElement("div"),
				parentElem = document.createElement("div"),
				type = "speak",
				data = KM.getData(domElem),
		    listener1,
		    listener2;

		parentElem.appendChild(domElem);
		listener1 = jasmine.createSpy('listener1');
		listener2 = jasmine.createSpy('listener2');

		it("can trigger the specific event on the element", function(){
			KM.EventUtil.addEventListener(domElem, type, listener1);
			expect(listener1).not.toHaveBeenCalled();

			KM.EventUtil.triggerEvent(domElem, type);
			expect(listener1).toHaveBeenCalled();
		});

		it("and the event can propagate", function(){
			KM.EventUtil.addEventListener(parentElem, type, listener2);
			expect(listener2).not.toHaveBeenCalled();

			KM.EventUtil.triggerEvent(domElem, type);
			expect(listener2).toHaveBeenCalled();
		});
	});