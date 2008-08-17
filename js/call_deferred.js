// CALL: Call deferred
// Version 2

// we use this to overcome the limitations on internet explorer with setTimeout (which are that you can't pass extra arguments), notice that it may overflow after some time because it uses an index to know which call we are talking about

// This is the function to call

function CALL_CallDeferred(method, ms, reference)
{
    var i = CALL_DeferredRunHandles.length;
    CALL_DeferredRunHandles[i] = {method: method, reference: reference};
    setTimeout("CALL_RunDeferred(" + i + ")", ms);
}

// This is all private

var CALL_DeferredRunHandles = [];

function CALL_RunDeferred(i)
{
    CALL_DeferredRunHandles[i].method(CALL_DeferredRunHandles[i].reference);
    delete CALL_DeferredRunHandles[i];
}

