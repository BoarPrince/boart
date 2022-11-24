# 1. Sync Backends Carrier

tags: env-all, sb-11, sb-11-2, masterdata-sync

## 1.1. Add a carrier

tags: sb-11-2.1

* Test description

   |action     |value                                                                |
   |-----------|---------------------------------------------------------------------|
   |description|Add first a company and than add the carrrier via MasterData Rest API|
   |           |* Carrier must exist in Fleet                                        |
   |           |* Carrier must exist in Fuel                                         |
   |priority   |high                                                                 |

* request admin bearer

* queues bind "fleet-error, company, carrier"

* add company and carrier

* queues check "fleet-error, company, carrier"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "", driver: "", vehicle: ""

## 1.2. Add carrier cascaded (company/carrier)

tags: sb-11-2.2

* Test description

   |action     |value                                                 |
   |-----------|------------------------------------------------------|
   |description|Add a company/carrier cascaded via MasterData Rest API|
   |           |* Carrier must exist in Fleet                         |
   |           |* Carrier must exist in Fuel                          |
   |priority   |high                                                  |

* request admin bearer

* queues bind "fleet-error, company, carrier"

* add company and carrier, cascaded

* queues check "fleet-error, company, carrier"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "", driver: "", vehicle: ""

## 1.3. Update carrier

tags: sb-11-2.3

* Test description

   |action     |value                                   |
   |-----------|----------------------------------------|
   |description|Update a carrier via MasterData Rest API|
   |           |* Carrier must updated in Fleet         |
   |           |* Carrier must updated in Fuel          |
   |priority   |high                                    |

* request admin bearer

* add company and carrier

* queues bind "fleet-error, carrier"

* Rest call

   |action                |value                                 |
   |----------------------|--------------------------------------|
   |method:put            |/api/carrier/${store:response-ca.id}  |
   |description           |Update a Carrier                      |
   |payload               |${store:response-ca}                  |
   |payload#carrierName   |${context:payload.carrierName}-updated|
   |payload#initialPin    |1234                                  |
   |expected:header#status|200                                   |
   |store                 |response-ca                           |

* queues check "fleet-error, carrier"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "", driver: "", vehicle: ""

## 1.4. Update carrier, cascaded

tags: sb-11-2.4

* Test description

   |action     |value                                                    |
   |-----------|---------------------------------------------------------|
   |description|Update a company/carrier cascaded via MasterData Rest API|
   |           |* Carrier must updated in Fleet                          |
   |           |* Carrier must updated in Fuel                           |
   |priority   |high                                                     |

* request admin bearer

* add company and carrier, cascaded

* queues bind "fleet-error, company, carrier"

* Rest call

   |action                         |value                                                |
   |-------------------------------|-----------------------------------------------------|
   |method:put                     |/api/company/${store:response-co.id}                 |
   |payload                        |${store:response-co}                                 |
   |payload#carriers[0].carrierName|${context:payload.carriers[0].carrierName}-updated   |
   |payload#carriers[0].initialPin |1234                                                 |
   |description                    |Update a cascaded Company request (including Carrier)|
   |expected:header#status         |200                                                  |
   |store                          |response-co                                          |
   |store#carriers[0]              |response-ca                                          |

* queues check "fleet-error, company, carrier"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "", driver: "", vehicle: ""

## 1.5. Delete only one carrier

tags: sb-11-2.5

* Test description

   |action     |value                                                           |
   |-----------|----------------------------------------------------------------|
   |description|Delete the only one carrier of a company via MasterData Rest API|
   |           |* Carrier must be deleted in Fleet                              |
   |           |* Carrier must be deleted in Fuel                               |
   |priority   |high                                                            |

* request admin bearer

* add company and carrier, cascaded

* queues bind "fleet-error, carrier"

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:delete         |/api/carrier/${store:response-ca.id}|
   |description           |Delete a Carrier                    |
   |expected:header#status|204                                 |

* queues check "fleet-error, carrier"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "", driver: "", vehicle: ""

## 1.6. Delete second carrier

tags: sb-11-2.6

* Test description

   |action     |value                                                           |
   |-----------|----------------------------------------------------------------|
   |description|Delete the only one carrier of a company via MasterData Rest API|
   |           |* Carrier must be deleted in Fleet                              |
   |           |* Carrier must be deleted in Fuel                               |
   |priority   |high                                                            |

* request admin bearer

* add company and carrier, cascaded

* add carrier

* queues bind "fleet-error, carrier"

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:delete         |/api/carrier/${store:response-ca.id}|
   |description           |Delete a Carrier                    |
   |expected:header#status|204                                 |

* queues check "fleet-error, carrier"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "", driver: "", vehicle: ""
