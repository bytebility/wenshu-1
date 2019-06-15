import requests
import re
from bs4 import BeautifulSoup as bs
import execjs

DEBUG = True

class wenshu():
    def __init__(self):
        with open('./getKey.js') as f:
            js = f.read()
            self.JsVl5x = execjs.compile(js)
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

    def query(self,keyword:str):
        vjkl5 = self.getvjkl5()
        vl5x = self.getvl5x(vjkl5)
        Form = {'Param':'全文检索:'+keyword,'vl5x':vl5x,'Index':'1','Page': '10',
        'Direction': 'asc', 'number':r'&gui', 'Order':'法院层级',
        'guid': '9fe7a1b7-ca7d-898cee5c-894a7adb1c4a'}
        res = self.s.post('http://wenshu.court.gov.cn/List/ListContent',headers=self.Headers,data=Form)
        content = res.content.decode('utf-8')
        print(content)
        # JsString = self.getJsText(content)
        # JsString = self.hookJs(JsString)
        # Postfix = self.getUrlPostfix(JsString)
        # url = 'http://wenshu.court.gov.cn'+Postfix
        # print("Post验证前的URL=", url)
        # content = self.s.get(url,headers=self.Headers).content.decode('utf-8')
        # return content

if __name__ == '__main__':
    e = wenshu()
    result = e.query('奇艺')
