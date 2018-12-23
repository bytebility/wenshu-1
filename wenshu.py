import requests
import time
import execjs
import re
import time

class Wenshu(object):
    def __init__(self):
        # ErrorCount when fail to get vjkl5
        self.ErrorCount = 0
        # original Headers
        self.Headers = {
        'Host': 'wenshu.court.gov.cn',
        'Connection':'keep-alive',
        'Upgrade-Insecure-Requests':'1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
        'Cookie': '_gscu_2116842793=45092473uc3nx512; _gscbrs_2116842793=1; Hm_lvt_d2caefee2de09b8a6ea438d74fd98db2=1545147346,1545204416,1545232026,1545266680; ASP.NET_SessionId=siocz4gmsixfshwcb4fktozo; vjkl5=b940a98ff5acb350175187af1aba05df7dd5f45a; _gscs_2116842793=t45304151vjwc3314|pv:5; Hm_lpvt_d2caefee2de09b8a6ea438d74fd98db2=1545304545'
        }
        # init session
        self.s = requests.session()
        # init necessary JS script for generate vl5x
        self ._initJS()

    def _initJS(self):
        f = open('./getKey.js', 'r')
        jsstr = f.read()
        f.close()
        self.js = execjs.compile(jsstr)

    def getvjkl5(self):
        vjkl5 = self.s.get('http://wenshu.court.gov.cn/list/list/', headers=self.Headers).cookies['vjkl5']
        print('vjkl5=', vjkl5)
        if vjkl5 == '':
            self.getvjkl5()
        return vjkl5

    def getvl5x(self, vjkl5):
        try :
            temp = self.js.call('strToLong', vjkl5)%400
            vl5x = self.js.call('makeKey_'+str(temp), vjkl5)
        except TypeError:
            self.ErrorCount += 1
            if self.ErrorCount == 5:
                raise TypeError("Failed to execute JS")
            self.getvl5x(vjkl5)
        print("vl5x= ", vl5x)
        return vl5x

    def query(self, keyword = '', Index = 1):
        self.ErrorCount = 0
        vjkl5 = self.getvjkl5()
        vl5x = self.getvl5x(vjkl5)

        PostForm = {'Param':'全文检索:'+keyword,
                    'Index':Index,
                    'Page':10,
                    'Order':"法院层级",
                    'Direction':'asc',
                    'vl5x':vl5x,
                    'number':r"&gui",
                    'guid':'&gui'
        }
        Headers = {
        'Host': 'wenshu.court.gov.cn',
        'Connection':'keep-alive',
        'Upgrade-Insecure-Requests':'1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7'}

        Content = self.s.post('http://wenshu.court.gov.cn/List/ListContent', data=PostForm,headers=Headers).content.decode('utf-8')
        if Content == 'remind_key':
            return []
        return Content

    def getID(self, content):
        pass
