suite('Core', function(){
  var node;

  setup(function () {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  teardown(function () {
    document.body.removeChild(node);
  });

  suite('new p5(sketch, null, true)', function () {

    // The reason why these tests run inside the suite() { ... } block is
    // because they test code that checks document.readyState.  If we waited
    // to run the test in test() { ... } the page would already be loaded and
    // readyState would be "completed".  By doing the tests things this way
    // readyState is "loading" and we can verify that the code is doing the
    // right thing during page load.

    var myp5 = new p5(function() { }, null, true);
    var isDrawingContextDefined = myp5.drawingContext !== undefined;

    test('should define drawContext synchronously', function () {
      assert.ok(isDrawingContextDefined);
    });
  });

  suite('new p5(sketch, null, false)', function () {
    var myp5 = new p5(function() { }, null, false);
    var isDrawingContextDefined = myp5.drawingContext !== undefined;

    test('should define drawContext asynchronously', function () {
      assert.equal(isDrawingContextDefined, false);
      assert.isDefined(myp5.drawingContext);
    });
  });

  suite('new p5(sketch, node, true)', function () {
    var myp5 = new p5(function() { }, node, true);
    var isDrawingContextDefined = myp5.drawingContext !== undefined;

    test('should define drawContext synchronously', function () {
      assert.ok(isDrawingContextDefined);
    });
  });

  suite('new p5(sketch, node)', function () {
    var myp5 = new p5(function() { }, node);
    var isDrawingContextDefined = myp5.drawingContext !== undefined;

    test('should define drawContext asynchronously', function () {
      assert.equal(isDrawingContextDefined, false);
      assert.isDefined(myp5.drawingContext);
    });
  });

  suite('new p5(sketch, true)', function () {
    var myp5 = new p5(function() { }, true);
    var isDrawingContextDefined = myp5.drawingContext !== undefined;

    test('should define drawContext synchronously', function () {
      assert.ok(isDrawingContextDefined);
    });
  });

  suite('new p5(sketch)', function () {
    var myp5 = new p5(function() { });
    var isDrawingContextDefined = myp5.drawingContext !== undefined;

    test('should define drawContext asynchronously', function () {
      assert.equal(isDrawingContextDefined, false);
      assert.isDefined(myp5.drawingContext);
    });
  });

  suite('p5.prototype', function() {
    //var prototype = p5;
    //var result;
    /*suite('abs()', function() {
      test('should be a function', function() {
        assert.ok(abs);
        assert.typeOf(abs, 'function');
      });
      test('should return a number', function() {
        result = abs();
        assert.typeOf(result, 'number');
      });
      test('should return an absolute value', function() {
        result = abs(-1);
        assert.equal(result, 1);
        assert.notEqual(result, -1);
      });
    });*/
  });

  suite('p5.prototype.registerMethod', function() {
    test('should register and call "init" methods', function() {
      var originalInit = p5.prototype._registeredMethods.init;
      var myp5, myInitCalled;

      p5.prototype._registeredMethods.init = [];

      try {
        p5.prototype.registerMethod('init', function myInit() {
          assert(!myInitCalled,
                 'myInit should only be called once during test suite');
          myInitCalled = true;

          this.myInitCalled = true;
        });

        myp5 = new p5(function(sketch) {
          assert(sketch.hasOwnProperty('myInitCalled'));
          assert(sketch.myInitCalled);

          sketch.sketchFunctionCalled = true;
        });

        assert(myp5.sketchFunctionCalled);
      } finally {
        p5.prototype._registeredMethods.init = originalInit;
      }
    });
  });

  suite('p5.prototype._createFriendlyGlobalFunctionBinder', function() {
    var noop = function() {};
    var createBinder = p5.prototype._createFriendlyGlobalFunctionBinder;
    var logMsg, globalObject, bind;

    beforeEach(function() {
      globalObject = {};
      logMsg = undefined;
      bind = createBinder({
        globalObject: globalObject,
        log: function(msg) {
          if (logMsg !== undefined) {
            // For simplicity, we'll write each test so it's expected to
            // log a message at most once.
            throw new Error('log() was called more than once');
          }
          logMsg = msg;
        }
      });
    });

    if (!window.IS_TESTING_MINIFIED_VERSION) {
      test('should warn when globals already exist', function() {
        globalObject.text = 'hi';
        bind('text', noop);
        assert.match(logMsg, /p5 had problems creating .+ "text"/);
        assert.equal(globalObject.text, noop);
      });

      test('should warn when globals are overwritten', function() {
        bind('text', noop);
        globalObject.text = 'boop';

        assert.match(logMsg, /You just changed the value of "text"/);
        assert.equal(globalObject.text, 'boop');
        assert.deepEqual(Object.keys(globalObject), ['text']);
      });
    } else {
      test('should NOT warn when globals already exist', function() {
        globalObject.text = 'hi';
        bind('text', noop);
        assert.isUndefined(logMsg);
        assert.equal(globalObject.text, noop);
      });

      test('should NOT warn when globals are overwritten', function() {
        bind('text', noop);
        globalObject.text = 'boop';

        assert.isUndefined(logMsg);
        assert.equal(globalObject.text, 'boop');
        assert.deepEqual(Object.keys(globalObject), ['text']);
      });
    }

    test('should allow overwritten globals to be overwritten', function() {
      bind('text', noop);
      globalObject.text = 'boop';
      globalObject.text += 'blap';
      assert.equal(globalObject.text, 'boopblap');
    });

    test('should allow globals to be deleted', function() {
      bind('text', noop);
      delete globalObject.text;
      assert.isUndefined(globalObject.text);
      assert.isUndefined(logMsg);
    });

    test('should create enumerable globals', function() {
      bind('text', noop);
      assert.deepEqual(Object.keys(globalObject), ['text']);
    });

    test('should not warn about overwriting print()', function() {
      globalObject.print = window.print;
      bind('print', noop);
      assert.equal(globalObject.print, noop);
      assert.isUndefined(logMsg);
    });

    test('should not warn about overwriting non-functions', function() {
      bind('mouseX', 5);
      globalObject.mouseX = 50;
      assert.equal(globalObject.mouseX, 50);
      assert.isUndefined(logMsg);
    });
  });
});
