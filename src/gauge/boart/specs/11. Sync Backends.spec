# 1. Sync Backends

tags: env-all, onboarding, sb-11

## 1.1. Add first company and then a carrier

tags: sb-11.1

* Test description

   |action     |value                                                                |
   |-----------|---------------------------------------------------------------------|
   |description|Add first a company and than add the carrrier via MasterData Rest API|
   |           |* Company must exists in Fleet                                       |
   |           |* Carrier must exist in Fleet and Fuel                               |
   |priority   |high                                                                 |

* request admin bearer

* queues bind "fleet-error, company, carrier"

* add company and carrier

* queues check "fleet-error, company, carrier"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: ""

## 1.2. Add company and carrier cascaded

tags: sb-11.2

* Test description

   |action     |value                                                 |
   |-----------|------------------------------------------------------|
   |description|Add a company/carrier cascaded via MasterData Rest API|
   |           |* Company must exists in Fleet                        |
   |           |* Carrier must exist in Fleet and Fuel                |
   |priority   |high                                                  |

* request admin bearer

* queues bind "fleet-error, company, carrier"

* add company and carrier, cascaded

* queues check "fleet-error, company, carrier"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: ""

## 1.3. Add a User

tags: sb-11.3

* Test description

   |action     |value                     |
   |-----------|--------------------------|
   |description|Add a user to a carrier   |
   |           |* User must exist in Fleet|
   |           |* User must exist in Fuel |
   |priority   |high                      |

* request admin bearer

* add company and carrier, cascaded

* queues bind "fleet-error, user"

* add user

* queues check "fleet-error, user"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "${store:response-user}"
