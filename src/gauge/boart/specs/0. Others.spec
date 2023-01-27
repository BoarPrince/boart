# 1. Others - MasterData

tags: env-all, master-data, md-1, masterdata

## 1.1. Health Check

tags: md-0.1

* Test description

   |action     |value                                             |
   |-----------|--------------------------------------------------|
   |description|Health Check must be usable without authentication|
   |priority   |high                                              |


* Rest call

   |action                |value            |
   |----------------------|-----------------|
   |method:get            |/actuator/health |
   |description           |Call Health check|
   |expected:header#status|200              |


## 1.2. Read Version

tags: md-0-2

* Rest call

   |action                 |value                                         |
   |-----------------------|----------------------------------------------|
   |method:get             |/info/version                                 |
   |description            |Reads the version of the running backend      |
   |expected:status        |200                                           |
   |expected:jsonLogic:true|{"==" : [{ "var" : "version" }, "v.0.0.61" ] }|

