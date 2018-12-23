# wenshu
中国裁判文书网爬虫,12-23更新

使用方法:
from vl5x import Wenshu \n
exp = Wenshu()
exp.query(keyword='', Index=1) 
其中Index为页码

目前实现了vl5x的破解，接口已经可以出文书名称和文书ID
日后更新验证码识别，文书ID解析下载等功能
