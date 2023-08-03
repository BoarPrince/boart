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

tags: md-0.2

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
   |expected:header#headers.version|1.1.1                                   |

## 1.3. Read Open API

tags: md-0.3

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

## 1.4. Test Listener

tags: md-0.4

* Test description

   |action     |value |
   |-----------|------|
   |description|xxxxxx|
   |priority   |high  |

* RabbitMQ listening, continue

   |action     |value|
   |-----------|-----|
   |description|xxx  |
   |exchange   |user |
   |routing    |rrr  |
   |store:name |aaa  |

* RabbitMQ publish

   |action        |value   |
   |--------------|--------|
   |description   |yyyy    |
   |exchange      |user    |
   |header#x-delay|2000    |
   |routing       |rrr     |
   |payload       |{"a": 1}|
   |--wait:after  |3       |

* Data manage

   |action           |value       |
   |-----------------|------------|
   |in               |${store:aaa}|
   |description      |xxx         |
   |expected#[0].data|{"a":1}     |

## 1.5. Request Admin Token

tags: md-0.4

* Test description

   |action     |value                                  |
   |-----------|---------------------------------------|
   |description|request admin token from local keycloak|
   |priority   |high                                   |

* Rest authorize

   |action     |value                                                                                                                                   |
   |-----------|----------------------------------------------------------------------------------------------------------------------------------------|
   |url        |http://localhost:8080/realms/jitpay/protocol/openid-connect/token                                                                       |
   |description        |aaaaa                                                                                                                           |
   |grantType  |password                                                                                                                                |
   |--scope      |openid locations_api fleet_profile fleet_role fleet_apiscope app_api jitpay.role fleet_apiscope email idgen_api ds_api mobilefileagg_api|
   |scope      |openid masterdata_api profile roles|
   |clientId   |jitfleet_portal                                                                                                                         |
   |username   |${env:admin_login_user}                                                                                                                 |
   |password   |${env:admin_login_password}                                                                                                             |
   |retry:count|2                                                                                                                                       |

curl -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d 'grant_type=password&client_id=jitfleet_portal&username=admin.masterdata&password=admin' \
    "http://localhost:8080/realms/jitpay/protocol/openid-connect/token"


curl --location --request POST 'http://localhost:8080/realms/jitpay/protocol/openid-connect/token' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'password=demoJITpay#123' \
    --data-urlencode 'username=demo@jitpay.eu' \
    --data-urlencode 'client_id=jitfleet_portal' \
    --data-urlencode 'grant_type=password'

    --data-urlencode 'client_secret=shjD8u7rlZRcjmen2uehiyxFLXKlftVV' \


curl --location --request POST 'http://localhost:8080/realms/jitpay/protocol/openid-connect/token' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'password=demoJITpay#123' \
    --data-urlencode 'username=demo@jitpay.eu' \
    --data-urlencode 'client_id=jitfleet_portal' \
    --data-urlencode 'grant_type=password' | jq .access_token | jwt