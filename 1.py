import requests
import re
from bs4 import BeautifulSoup as bs
import execjs
import re
import time
import json

DEBUG = True

class wenshu():
    def __init__(self):
        with open('./getKey.js') as f:
            js = f.read()
            self.JsVl5x = execjs.compile(js)
        with open('./Navi.js') as f1:
            js = f1.read()
            self.JsNavi = execjs.compile(js)
        # testResult = self.getDocID('ZcONTQrDgjAQwobDocKrSBTCmkLClcKJw7Ynw6IVXMK6w4zCpm1mbMKgwrViZkA8wr3DicOCwpXCm3cxD3wTwpFvYcOBVVgXO8KtwrYvwowyw7M1RFbDpWHCjFHCqwnDg31iVW1UA8OwfMO/w47CtD54H8ODB8KzGMKbw6HDsjcww7Eya8OlwqQbaUhFT8K5wrVxw5LCkD87IcKCw5HCiR3CqHPDkkJvwpPDtsOgwpPDlsKAwqnDhsO6wqzCvnFyAjjCpg9FZQDD')
        # print(testResult)
        # time.sleep(123)
        self.Headers = {'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.90 Safari/537.36'}
        self.__createSession()
        content=self.s.get("http://wenshu.court.gov.cn/",headers=self.Headers).content.decode('utf-8')



    def getJsText(self,body:str):
        soup = bs(body,'lxml')
        return soup.script.text

    def hookJs(self,JsString:str):
        # hook a flag
        JsString = JsString.replace("=_0x3ab53f","=function(){return true}")
        # hook _0xcd071f
        JsString = JsString.replace("window[_0x213d('0x3e','NS17')]=_0xcd071f;",r"return _0xcd071f;")
        return JsString

    def getUrlPostfix(self,JsString:str):
        js = execjs.compile(JsString)
        return js.call('_0xd1b242')



    def getvjkl5(self):
        res = self.s.get("http://wenshu.court.gov.cn/list/list/",headers=e.Headers)
        vjkl5 = res.headers["Set-Cookie"].split(';')[0].replace('vjkl5=','')
        if DEBUG:
            print('vjkl5=',vjkl5)
        return vjkl5

    def getvl5x(self,vjkl5):
        vl5x = self.JsVl5x.call('getKey',vjkl5)
        if DEBUG:
            print('vl5x=',vl5x)
        return vl5x
    # when the session failed
    # call this method to refresh the session
    def refreshSession(self):
        self.s = requests.Session()
        content = self.s.get('http://wenshu.court.gov.cn/',headers=self.Headers).content.decode('utf-8')
        JsString = self.getJsText(content)
        JsString = self.hookJs(JsString)
        UrlPostfix = self.getUrlPostfix(JsString)
        result = self.s.get('http://wenshu.court.gov.cn/'+UrlPostfix,headers=self.Headers).content.decode('utf-8')
        if "首页 - 中国裁判文书网" in result:
            return True
        else:
            return false

    # private Method when init the wenshu Object
    def __createSession(self):
        self.s = requests.Session()
        content = self.s.get('http://wenshu.court.gov.cn/',headers=self.Headers).content.decode('utf-8')
        JsString = self.getJsText(content)
        JsString = self.hookJs(JsString)
        UrlPostfix = self.getUrlPostfix(JsString)
        result = self.s.get('http://wenshu.court.gov.cn/'+UrlPostfix,headers=self.Headers).content.decode('utf-8')
        if "首页 - 中国裁判文书网" in result:
            print("初始化成功")
        else:
            print("初始化失败")

    # return the document Url for the result(depends on keyword and other arguments)
    # return a list
    def query(self,keyword:str):
        vjkl5 = self.getvjkl5()
        vl5x = self.getvl5x(vjkl5)
        Form = {'Param':'全文检索:'+keyword,'vl5x':vl5x,'Index':'1','Page': '10',
        'Direction': 'asc', 'number':r'&gui', 'Order':'法院层级',
        'guid': '9fe7a1b7-ca7d-898cee5c-894a7adb1c4a'}
        res = self.s.post('http://wenshu.court.gov.cn/List/ListContent',headers=self.Headers,data=Form)
        content = res.content.decode('utf-8')
        # print(content)
        print(content)
        InfoList = eval(eval(content))
        # InfoList1 = eval(content1)
        print(type(InfoList))
        # print(type(InfoList1))
        RunEvalString = InfoList[0]['RunEval']
        print(RunEvalString)
        # get the true com.str._KEY
        key = self.getKEY(RunEvalString)

        IDlist = []
        if len(InfoList) > 1:
            try:
                for i in InfoList[1:]:
                    IDlist.append(i['文书ID'])
            except KeyError:
                pass
            print('获取到',len(IDlist),'个ID')
            # update key
            print('IDlist =',IDlist)
        else:
            print('没有获取到文书ID')

        DocIDlist = []
        UrlList = []
        if IDlist!= []:
            for id in IDlist:
                temp = self.getDocID(id,key)
                DocIDlist.append(temp)
            UrlList = [self.getDocumentUrl(a) for a in DocIDlist]
        return UrlList

    # Process DocID from id
    def getDocID(self,id,key):
        # print('enter get DocID')
        DocID = self.JsNavi.call('Navi',id,key)
        print('Navi id = ', id)
        # print('succeed get DocID')
        return DocID

    # each time you get a RunEval key from post method
    # you run this to update the com.str._KEY in the js
    def getKEY(self,RunEval):
        result = self.JsNavi.call('jsfuck',RunEval)
        # print('RunEval = ',RunEval)
        # com = self.JsNavi.call('checkcom')
        # print('after update, _KEY=',com)
        return result


    # get Document Url
    def getDocumentUrl(self,DocID):
        return 'http://wenshu.court.gov.cn/CreateContentJS/CreateContentJS.aspx?DocID=' + DocID



if __name__ == '__main__':
    e = wenshu()
    result = e.query('奇艺')
    print(result)
