# wenshu

这一版本已经解决首页的302跳转js加密
和搜索文书接口的vl5x参数的获取
可以成功生成指向文书内容的url接口，带header的get即可获取文书内容




使用方法:  
e = wenshu()  
e.query('奇艺')
返回直接指向文书内容页面的一个存放url的list

关键字自己修改上面的中文即可
如果要实现翻页等功能，自己修改一下post的表单的函数即可
只提供一个思想模型，仅供学习使用。侵权请联系删除

### 2019-6-17 更新
完善上述功能

### To do list
增加cookie过期自动重连功能
完善翻页，显示个数等自定义获取信息DIY功能

