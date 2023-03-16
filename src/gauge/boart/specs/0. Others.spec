# 1. Others - MasterData

tags: env-all, master-data, md-0, masterdata

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

* Test description

   |action     |value                         |
   |-----------|------------------------------|
   |description|Version Info must be available|
   |priority   |high                          |

* Rest call

   |action                         |value                                   |
   |-------------------------------|----------------------------------------|
   |method:get                     |/info/version                           |
   |description                    |Reads the version of the running backend|
   |expected:header#status         |200                                     |
   |expected:header#headers.version|1.1.0                                   |

## 1.3. Read Open API

tags: md-0-2

* Test description

   |action     |value                                    |
   |-----------|-----------------------------------------|
   |description|Open API specification must be accessable|
   |priority   |high                                     |

* Rest call

   |action                |value                           |
   |----------------------|--------------------------------|
   |method:get            |/v3/api-docs                    |
   |description           |Reads the open api specification|
   |expected:header#status|200                             |
   |expected#info.title   |JITPay Masterdata               |
