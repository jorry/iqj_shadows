#### 目前  全量发包和灰度测试 的数据存储在 hotFix  表中

关于接口(接口文档在sosoApi)
 
    为了演示,所以需要写两个接口,一个用于灰度(灰度根据tags   7),一个用于全量(4)
    
正常流程: 通过统一的接口来获取需要灰度还是全量更新的接口,1. 先验证是否有灰度(每个app有自己的版本号,app有自己的专属补丁(补丁id = 数据库id))
       2. 如果有灰度补丁,那么验证客户端的补丁版本是否小于服务器的补丁版本
       3. 如果是灰度,那么就灰度. 如果不是灰度,那么正常验证全量更新的版本信息
       4. 首要条件是: 每个版本对应自己的补丁

临时解决方案:  有各自的接口哦