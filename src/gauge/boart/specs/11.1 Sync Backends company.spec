# 1. Sync Backends Company

tags: env-all, sb-11, sb-11-1, masterdata-sync

## 1.1. Add company

tags: sb-11-1.1

* Test description

   |action     |value                                |
   |-----------|-------------------------------------|
   |description|Add a company via MasterData Rest API|
   |           |* Company must exists in Fleet       |
   |priority   |high                                 |

* queues bind "fleet-error, company"

* add company

* queues check "fleet-error, company"

* check db backend sync, company: "${store:response-co}", carrier: "", user: "", driver: "", vehicle: ""

## 1.2. Add company without an address

tags: sb-11-1.2

* Test description

   |action     |value                              |
   |-----------|-----------------------------------|
   |description|Update a company without an address|
   |           |* Company must updated in Fleet    |
   |priority   |high                               |

* queues bind "fleet-error, company"

* request admin bearer

* Rest call

   |action                |value                              |
   |----------------------|-----------------------------------|
   |method:post           |/api/company                       |
   |payload               |<file:request-company.json>        |
   |payload#addresses     |undefined                          |
   |description           |Create a Company without an address|
   |expected:header#status|200                                |
   |store                 |response-co                        |

* queues check "fleet-error, company"

* check db backend sync, company: "${store:response-co}", carrier: "", user: "", driver: "", vehicle: ""

## 1.3. Add company without taxid, but vatid

tags: sb-11-1.3

* Test description

   |action     |value                           |
   |-----------|--------------------------------|
   |description|Update a company only with vatId|
   |           |* Company must updated in Fleet |
   |priority   |high                            |

* queues bind "fleet-error, company"

* request admin bearer

* Rest call

   |action                |value                      |
   |----------------------|---------------------------|
   |method:post           |/api/company               |
   |payload               |<file:request-company.json>|
   |payload#vatId         |${context:payload.taxId}   |
   |payload#taxId         |undefined                  |
   |description           |Create a Company with vatId|
   |expected:header#status|200                        |
   |store                 |response-co                |

* queues check "fleet-error, company"

* check db backend sync, company: "${store:response-co}", carrier: "", user: "", driver: "", vehicle: ""

## 1.4. Update company

tags: sb-11-1.4

* Test description

   |action     |value                                |
   |-----------|-------------------------------------|
   |description|Add a company via MasterData Rest API|
   |           |* Company must exists in Fleet       |
   |priority   |high                                 |

* request admin bearer

* add company

* queues bind "fleet-error, company"

* Rest call

   |action                |value                                 |
   |----------------------|--------------------------------------|
   |method:put            |/api/company/${store:response-co.id}  |
   |payload               |${store:response-co}                  |
   |payload#companyName   |${context:payload.companyName}-Updated|
   |payload#jitPayId      |${context:payload.jitPayId}-Updated   |
   |description           |Update a Company                      |
   |expected:header#status|200                                   |
   |store                 |response-co                           |

* queues check "fleet-error, company"

* check db backend sync, company: "${store:response-co}", carrier: "", user: "", driver: "", vehicle: ""

## 1.5. Update company

tags: sb-11-1.5

* Test description

   |action     |value                                |
   |-----------|-------------------------------------|
   |description|Add a company via MasterData Rest API|
   |           |* Company must exists in Fleet       |
   |priority   |high                                 |

* request admin bearer

* add company

* queues bind "fleet-error, company"

* Rest call

   |action                |value                                 |
   |----------------------|--------------------------------------|
   |method:put            |/api/company/${store:response-co.id}  |
   |payload               |${store:response-co}                  |
   |payload#companyName   |${context:payload.companyName}-Updated|
   |payload#jitPayId      |${context:payload.jitPayId}-Updated   |
   |description           |Update a Company                      |
   |expected:header#status|200                                   |
   |store                 |response-co                           |

* queues check "fleet-error, company"

* check db backend sync, company: "${store:response-co}", carrier: "", user: "", driver: "", vehicle: ""

## 1.6. Update company, change Address

tags: sb-11-1.6

* Test description

   |action     |value                                                  |
   |-----------|-------------------------------------------------------|
   |description|Change the address of a company via MasterData Rest API|
   |           |* Company must be changed in Fleet                     |
   |priority   |high                                                   |

* request admin bearer

* add company

* queues bind "fleet-error, company"

* Rest call

   |action                      |value                                    |
   |----------------------------|-----------------------------------------|
   |method:put                  |/api/company/${store:response-co.id}     |
   |payload                     |${store:response-co}                     |
   |payload#addresses[0].street |${context:payload.addresses[0].street}-u |
   |payload#addresses[0].city   |${context:payload.addresses[0].city}-u   |
   |payload#addresses[0].zipCode|${context:payload.addresses[0].zipCode}-u|
   |description                 |Update Address of a Company              |
   |expected:header#status      |200                                      |
   |store                       |response-co                              |

* queues check "fleet-error, company"

* check db backend sync, company: "${store:response-co}", carrier: "", user: "", driver: "", vehicle: ""

## 1.7. Delete a Company

tags: sb-11-1.7

* Test description

   |action     |value                                   |
   |-----------|----------------------------------------|
   |description|Delete a company via MasterData Rest API|
   |           |* Company must be deleted on Fleet      |
   |priority   |high                                    |

* request admin bearer

* add company

* queues bind "fleet-error, company"

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:delete         |/api/company/${store:response-co.id}|
   |description           |Delete a Company                    |
   |expected:header#status|204                                 |

* queues check "fleet-error, company"

* check db backend delete sync, company: "${store:response-co.id}", carrier: "", child: "", "company"
