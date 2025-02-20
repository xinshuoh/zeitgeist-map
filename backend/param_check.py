from flask import request, jsonify

class P:
    def __or__(self, other):
        return P_or(self, other) 

    def __and__(self, other):
        return P_and(self, other)

class P_all(P):
    def satisfied(self, params):
        return True

class P_literal(P):
    all = P_all()
    def __init__(self, s):
        self.s = s
    
    def satisfied(self, params):
        return self.s in params

class P_or(P):
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def satisfied(self, params):
        return self.a.satisfied(params) or self.b.satisfied(params)

class P_and(P):
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def satisfied(self, params):
        return self.a.satisfied(params) and self.b.satisfied(params)

p = P_literal

def args(req):
    def dec(fn):
        def f():
            if not req.satisfied(request.args):
                return "Missing parameters in query string", 400
            return fn()
        f.__name__ = fn.__name__
        return f
    return dec