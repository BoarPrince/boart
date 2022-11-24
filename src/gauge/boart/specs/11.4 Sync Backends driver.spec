# 1. Sync Backends Driver

tags: env-all, sb-11, sb-11-4, masterdata-sync

## 1.1. Add a Driver

tags: sb-11-4.1

* Test description

   |action     |value                       |
   |-----------|----------------------------|
   |description|Add a driver to a carrier   |
   |           |* Driver must exist in Fleet|
   |           |* Driver must exist in Fuel |
   |priority   |high                        |

* request admin bearer

* add company and carrier, cascaded

* add user

* queues bind "fleet-error, driver"

* add driver, cascaded

* queues check "fleet-error, driver"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "${store:response-user}", driver: "${store:response-driver}", vehicle: ""

## 1.2. Add a Driver, cascaded with user

tags: sb-11-4.2

* Test description

   |action     |value                        |
   |-----------|-----------------------------|
   |description|Add a driver cascaded by user|
   |           |* Driver must exist in Fleet |
   |           |* Driver must exist in Fuel  |
   |priority   |high                         |

* request admin bearer

* add company and carrier, cascaded

* queues bind "fleet-error, driver"

* Rest call

   |action                |value                     |
   |----------------------|--------------------------|
   |method:post           |/api/user                 |
   |description           |Add a User/Driver         |
   |payload               |<file:request-user.json>  |
   |payload#driver        |<file:request-driver.json>|
   |expected:header#status|200                       |
   |store                 |response-user             |
   |store#driver          |response-driver           |

* queues check "fleet-error, driver"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "${store:response-user}", driver: "${store:response-driver}", vehicle: ""

## 1.3. Add a Driver, cascaded with carrier and user

tags: sb-11-4.3

* Test description

   |action     |value                                 |
   |-----------|--------------------------------------|
   |description|Add a driver cascaded by carrier, user|
   |           |* Driver must exist in Fleet          |
   |           |* Driver must exist in Fuel           |
   |priority   |high                                  |

* request admin bearer

* add company

* queues bind "fleet-error, carrier, user, driver"

* Rest call

   |action                           |value                      |
   |---------------------------------|---------------------------|
   |method:post                      |/api/carrier               |
   |description                      |Add a Carrier/User/Driver  |
   |payload                          |<file:request-carrier.json>|
   |payload#companyId                |${store:response-co.id}    |
   |payload#users[0]                 |<file:request-user.json>   |
   |payload#users[0].carrierIds[0]   |${context:payload.id}      |
   |payload#users[0].driver          |<file:request-driver.json> |
   |payload#users[0].driver.carrierId|${context:payload.id}      |
   |expected:header#status           |200                        |
   |store                            |response-ca                |
   |store#users[0]                   |response-user              |
   |store#users[0].driver            |response-driver            |

* queues check "fleet-error, carrier, user, driver"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "${store:response-user}", driver: "${store:response-driver}", vehicle: ""
