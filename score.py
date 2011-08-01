#!/usr/bin/python

import cgi
import cgitb; cgitb.enable()  # for troubleshooting
import re

print "Content-type: text/html"
print

form = cgi.FieldStorage()

def strip_html(inputStr):
    return re.sub('<[^<]+?>', '', inputStr)

fd = file('scores', 'r')
scores = fd.read().strip().splitlines()
fd.close()

def parseScores(scores):
    acc, tmp = [], {}
    if len(scores)%2 != 0: return []
    for i in xrange(0, len(scores), 2):
        tmp = {}
        tmp['name'] = scores[i]
        tmp['score'] = scores[i+1]
        acc.append(tmp)
    return acc

def writeScores(scores):
    #sort and then write only the top 10
    scores.sort(key=lambda d: int(d['score']), reverse=True)
    fd = file('scores', 'w')
    for score in scores[0:10]:
        fd.write(score['name'] + '\n')
        fd.write(score['score'] + '\n')
    fd.close()

scores = parseScores(scores)

if "new-score" in form and form["new-score"].value == '1':
	if "name" in form and "score" in form:
		if 0 < len(form["name"].value) < 50:
                        name = strip_html(form["name"].value)
			score = strip_html(form["score"].value)
                        scores.append({'name':name, 'score':score})
                        writeScores(scores)

acc = '['
for score in scores:
    acc += '{"name": "%s", "score": %s},' % (score['name'], score['score'])
acc = acc[0:-1] + ']'
print acc
