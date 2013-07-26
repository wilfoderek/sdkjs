//var NameFunctions = ["min", "max", "lim", "log", "ln", "sin", "cos", "tg", "ctg", "ch", "sh", "th", "cth", "sec", "csc", "cot", "csch", "sech", "coth"];
//var NameFunctions = ["min", "max", "lim", "log", "ln", "sin", "cos", "tan", "ctg", "cosh", "sinh", "tanh", "cth", "sec", "csc", "cot", "csch", "sech", "coth"];
//var Diff = ["dx","dy","dθ"];

function CLogarithm()
{
    CSubMathBase.call(this,1,2);
}
extend(CLogarithm, CSubMathBase);
CLogarithm.prototype.setContent = function()
{
    var oBase = new CMathContent();
    var GParams = Common_CopyObj(this.params);
    GParams.bMText = false;
    oBase.init(GParams);
    oBase.relate(this);
    oBase.addText("log");
    //oBase.setContent.apply(oBase, NameFunctions.minimax[3] );


    var oFunc = new CDegreeOrdinary(-1);
    oFunc.init(this.params);
    oFunc.relate(this);
    oFunc.setContent(oBase); //здесь выставляется для Base, что родительский класс CDegree...

    //todo
    //проверить !!!
    //var oArg = new CMathBase(1, 1);
    var oArg = new CMathContent();
    oArg.init(this.params);
    oArg.relate(this);
    oArg.fillPlaceholders();

    CLogarithm.superclass.setContent.call(this, oFunc, oArg);
}
CLogarithm.prototype.getFunction = function()
{
    return this.elements[0][0].getBase();
}
CLogarithm.prototype.getBase = function()
{
    return this.elements[0][0].getIterator();
}
CLogarithm.prototype.getArgument = function()
{
    return this.elements[0][1];
}

function CMinimaxFunc()
{
    CMathBase.call(this);
}
extend(CMinimaxFunc, CMathBase);
CMinimaxFunc.prototype.init = function()
{
    this.setDimension(2, 1);

    var oBase = new CMathContent();
    oBase.mergeTxtPrp({Italic: false});

    var oIter = new CMathContent();
    oIter.setReduct(DEGR_REDUCT);

    this.addMCToContent(oBase, oIter);
}
CMinimaxFunc.prototype.getCenter = function()
{
    return this.elements[0][0].size.center;
}
CMinimaxFunc.prototype.getBase = function()
{
    return this.elements[0][0];
}
CMinimaxFunc.prototype.getIterator = function()
{
    return this.elements[1][0];
}
CMinimaxFunc.prototype.old_setDistance = function()
{
    var iter = this.elements[1][0].size,
        ascent = iter.center + this.params.font.metrics.Placeholder.Height*DIV_CENTER;

    this.dH = this.params.font.metrics.Placeholder.Height - ascent;
    this.dW = 0;
    //this.dH = this.params.font.FontSize/16*g_dKoef_pt_to_mm;
}
CMinimaxFunc.prototype.setDistance = function()
{
    this.dH = 0.03674768518518519*this.getTxtPrp().FontSize;
}

function CMinimax()
{
    CSubMathBase.call(this);
}
extend(CMinimax, CSubMathBase);
CMinimax.prototype.init = function()
{
    this.setDimension(1, 2);
    var oFunc = new CMinimaxFunc();
    oFunc.init();

    var oArg = new CMathContent();

    this.addMCToContent(oFunc, oArg);
}
CMinimax.prototype.getFunction = function()
{
    return this.elements[0][0].getBase();
}
CMinimax.prototype.getIterator = function()
{
    return this.elements[0][0].getIterator();
}
CMinimax.prototype.getArgument = function()
{
    return this.elements[0][1];
}
CMinimax.prototype.setDistance = function()
{
    this.dW = this.getTxtPrp().FontSize/6*g_dKoef_pt_to_mm;
    this.dH = 0;
}

function CMathFunc()
{
    CMathBase.call(this);
}
extend(CMathFunc, CMathBase);
CMathFunc.prototype.init = function()
{
    this.setDimension(1, 2);
    this.setContent();
    this.elements[0][0].mergeTxtPrp({Italic: false}); // trigonometrical function
}
CMathFunc.prototype.setDistance = function()
{
    this.dW = this.getTxtPrp().FontSize/6*g_dKoef_pt_to_mm;
}
CMathFunc.prototype.getFunction = function()
{
    return this.elements[0][0];
}
CMathFunc.prototype.getArgument = function()
{
    return this.elements[0][1];
}


function old_CDifferential(num)
{
    this.num = num;
    CSubMathBase.call(this, 1,1);
}
extend(old_CDifferential, CSubMathBase);
old_CDifferential.prototype.setContent = function()
{
    var oDiff = new CMathContent();
    oDiff.init(this.params);
    oDiff.addText(Diff[this.num]);

    old_CMathFunc.superclass.setContent.call(this, oDiff);
}

function old_CTrigFunc(num)
{
    if(num != num + 0 || num < 0 || num > 14)
        return;

    this.num = num;
    //CSubMathBase.call(this, 1, 2);
    CMathBase.call(this, 1,2);

}
//extend(old_CTrigFunc,CSubMathBase);
extend(old_CTrigFunc, CMathBase);
old_CTrigFunc.prototype.setContent = function()
{
    var oFunc = new CMathContent();
    var GParms = Common_CopyObj(this.params);
    GParms.bMText = false;

    oFunc.init(GParms);
    oFunc.setContent.apply(oFunc, NameFunctions.trig[this.num] );

    var oArg  = new CMathContent();
    oArg.init(this.params);
    oArg.fillPlaceholders();

    old_CTrigFunc.superclass.setContent.call(this, oFunc, oArg);
}
old_CTrigFunc.prototype.setDistance = function()
{
    //todo
    //переделать!
    this.dW = slashWidth(this.params.font);
    this.dH = 0;
}
old_CTrigFunc.prototype.getFunction = function()
{
    return this.elemens[0][0];
}
old_CTrigFunc.prototype.getArgument = function()
{
    return this.elemens[0][1];
}
