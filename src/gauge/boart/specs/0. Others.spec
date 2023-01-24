# 1. Others - MasterData

tags: env-all, master-data, md-1, masterdata

## 1.1. Health Check

tags: md-1.1a

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

