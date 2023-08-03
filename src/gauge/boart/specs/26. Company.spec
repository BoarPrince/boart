# 1. Company - MasterData

tags: env-all, master-data, masterdata, md-26, company, v2

## 1.1. Check Version 1 triggered notification

tags: md-26.1, event

* Test description

   |action     |value                                                            |
   |-----------|-----------------------------------------------------------------|
   |description|Trigger changes on Version 1 Company and check event notification|
   |priority   |high                                                             |

* request admin bearer

* add company

* RabbitMQ bind

   |action     |value                       |
   |-----------|----------------------------|
   |exchange   |carrier                     |
   |queue      |test.md.v1.company          |
   |description|Bind carrier version 1 queue|
   |group      |Bind Queues                 |

* RabbitMQ bind

   |action     |value                       |
   |-----------|----------------------------|
   |exchange   |company                     |
   |queue      |test.md.v1.company          |
   |description|Bind carrier version 1 queue|
   |group      |Bind Queues                 |

* RabbitMQ bind

   |action     |value                       |
   |-----------|----------------------------|
   |exchange   |masterdata                  |
   |queue      |test.md.v2.company          |
   |description|Bind company version 2 queue|
   |group      |Bind Queues                 |

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* add carrier

* RabbitMQ consume, continue

   |action     |value                                 |
   |-----------|--------------------------------------|
   |queue      |test.md.v1.company                    |
   |group      |Check Queues (CREATE)                 |
   |description|CREATE V1: Company Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                   |
   |----------------------------------|----------------------------------------|
   |queue                             |test.md.v2.company                      |
   |group                             |Check Queues (CREATE)                   |
   |description                       |CREATE V2: Company Event must be fired  |
   |expected:header#headers.eventClass|Company                                 |
   |expected:header#headers.eventType |CREATE                                  |
   |expected#id                       |${store:response-co.id}                 |
   |expected#referenceId              |${store:response-co.jitPayId}           |
   |expected#bankAccount.iban         |${store:response-co.bankDetails[0].iban}|

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@     @@@@    @@   @@@@@  @@@@@  @ @@@@@@ @@@@@
@    @ @    @ @    @  @  @    @   @         @    @  @  @  @    @ @    @ @ @      @    @
@    @ @    @ @    @ @    @   @   @@@@@     @      @    @ @    @ @    @ @ @@@@@  @    @
@    @ @@@@@  @    @ @@@@@@   @   @         @      @@@@@@ @@@@@  @@@@@  @ @      @@@@@
@    @ @      @    @ @    @   @   @         @    @ @    @ @   @  @   @  @ @      @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@     @@@@  @    @ @    @ @    @ @ @@@@@@ @    @

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:put            |/api/carrier/${store:response-ca.id}|
   |description           |Update the Carrier                  |
   |group                 |Check Queues (UPDATE Carrier)       |
   |payload               |${store:response-ca}                |
   |expected:header#status|200                                 |

* RabbitMQ consume, continue

   |action     |value                                 |
   |-----------|--------------------------------------|
   |queue      |test.md.v1.company                    |
   |group      |Check Queues (UPDATE Carrier)         |
   |description|UPDATE V1: Company Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                 |
   |----------------------------------|--------------------------------------|
   |queue                             |test.md.v2.company                    |
   |group                             |Check Queues (UPDATE Carrier)         |
   |description                       |UPDATE V2: Company Event must be fired|
   |expected:header#headers.eventClass|Company                               |
   |expected:header#headers.eventType |UPDATE                                |
   |expected#id                       |${store:response-co.id}               |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@     @@@@   @@@@  @    @ @@@@@    @@   @    @ @   @
@    @ @    @ @    @  @  @    @   @         @    @ @    @ @@  @@ @    @  @  @  @@   @  @ @
@    @ @    @ @    @ @    @   @   @@@@@     @      @    @ @ @@ @ @    @ @    @ @ @  @   @
@    @ @@@@@  @    @ @@@@@@   @   @         @      @    @ @    @ @@@@@  @@@@@@ @  @ @   @
@    @ @      @    @ @    @   @   @         @    @ @    @ @    @ @      @    @ @   @@   @
 @@@@  @      @@@@@  @    @   @   @@@@@@     @@@@   @@@@  @    @ @      @    @ @    @   @

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:put            |/api/company/${store:response-co.id}|
   |description           |Update the Company                  |
   |group                 |Check Queues (UPDATE Company)       |
   |payload               |${store:response-co}                |
   |payload#carriers[0]   |${store:response-ca}                |
   |expected:header#status|200                                 |

* RabbitMQ consume, continue

   |action     |value                                 |
   |-----------|--------------------------------------|
   |queue      |test.md.v1.company                    |
   |group      |Check Queues (UPDATE Company)         |
   |description|UPDATE V1: Company Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                 |
   |----------------------------------|--------------------------------------|
   |queue                             |test.md.v2.company                    |
   |group                             |Check Queues (UPDATE Company)         |
   |description                       |UPDATE V2: Company Event must be fired|
   |expected:header#headers.eventClass|Company                               |
   |expected:header#headers.eventType |UPDATE                                |
   |expected#id                       |${store:response-co.id}               |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:delete         |/api/company/${store:response-co.id}|
   |description           |Delete the Company                  |
   |group                 |Check Queues (Delete Company)       |
   |expected:header#status|204                                 |

* RabbitMQ consume, continue

   |action     |value                                 |
   |-----------|--------------------------------------|
   |queue      |test.md.v1.company                    |
   |group      |Check Queues (DELETE Company)         |
   |description|DELETE V1: Company Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                 |
   |----------------------------------|--------------------------------------|
   |queue                             |test.md.v2.company                    |
   |group                             |Check Queues (DELETE Company)         |
   |description                       |DELETE V2: Company Event must be fired|
   |expected:header#headers.eventClass|Company                               |
   |expected:header#headers.eventType |DELETE                                |
   |expected#id                       |${store:response-co.id}               |

## 1.2. Retrieve Company

tags: md-26.2

* Test description

   |action     |value            |
   |-----------|-----------------|
   |description|Getting a company|
   |priority   |high             |

* request admin bearer

* add company and carrier

* Rest call

   |action                      |value                                   |
   |----------------------------|----------------------------------------|
   |method:get                  |/api/v2/company/${store:response-co#id} |
   |description                 |Read the company                        |
   |expected:header#status      |200                                     |
   |expected#id                 |${store:response-co.id}                 |
   |expected#name               |${store:response-ca.carrierName}        |
   |expected#taxNumber          |${store:response-co.taxId}              |
   |expected#bankAccount.id     |${store:response-co.bankDetails[0].id}  |
   |expected#bankAccount.iban   |${store:response-co.bankDetails[0].iban}|
   |expected#validatedEmail.id  |${store:response-ca.addresses[0].id}    |
   |expected#addresses[0].id    |${store:response-ca.addresses[0].id}    |
   |expected#addresses[0].street|${store:response-ca.addresses[0].street}|
   |expected#addresses[0].city  |${store:response-ca.addresses[0].city}  |

## 1.3. Retrieve Companies (paged, admin)

tags: md-26.3

* Test description

   |action     |value                                   |
   |-----------|----------------------------------------|
   |description|Getting all Companies with admin account|
   |priority   |high                                    |

* request admin bearer

* Rest call

   |action                        |value                    |
   |------------------------------|-------------------------|
   |method:get                    |/api/v2/company          |
   |description                   |Get all Companies (admin)|
   |expected:header#status        |200                      |
   |expected:greater#totalElements|10                       |

## 1.4. Retrieve Companies (paged, search, admin)

tags: md-26.4

* Test description

   |action     |value                                               |
   |-----------|----------------------------------------------------|
   |description|Getting Companies with admin account by searchString|
   |priority   |high                                                |

* request admin bearer

* add company and carrier

* Rest call

   |action                |value                                 |
   |----------------------|--------------------------------------|
   |method:get            |/api/v2/company                       |
   |query#searchString    |${store:response-ca.carrierName}      |
   |description           |Get Company with search (carrier name)|
   |expected:header#status|200                                   |
   |expected#totalElements|1                                     |

## 1.5. Add a company

tags: md-26.5

* Test description

   |action     |value        |
   |-----------|-------------|
   |description|Add a company|
   |priority   |high         |

* request admin bearer

* payload company

* Rest call

   |action                               |value                                           |
   |-------------------------------------|------------------------------------------------|
   |method:post                          |/api/v2/company                                 |
   |description                          |Creating a new company                          |
   |payload                              |${store:payload-co}                             |
   |expected:header#status               |200                                             |
   |expected#referenceId                 |${store:payload-co.referenceId}                 |
   |expected#vatId                       |${store?:payload-co.vatId}                      |
   |expected#taxNumber                   |${store:payload-co.taxNumber}                   |
   |expected#name                        |${store:payload-co.name}                        |
   |expected#legalForm                   |${store:payload-co.legalForm}                   |
   |expected#henriContactId              |${store:payload-co.henriContactId}              |
   |expected#status                      |${store:payload-co.status}                      |
   |expected#originPlatform              |${store:payload-co.originPlatform}              |
   |expected#originSource                |${store:payload-co.originSource}                |
   |expected#registryCourt               |${store:payload-co.registryCourt}               |
   |expected#commercialRegisterNr        |${store:payload-co.commercialRegisterNr}        |
   |expected#homePage                    |${store:payload-co.homePage}                    |
   |expected#salesManager                |${store:payload-co.salesManager}                |
   |expected#currency                    |${store:payload-co.currency}                    |
   |expected#initialPin                  |${store:payload-co.initialPin}                  |
   |expected#preferedCardIssuer          |${store:payload-co.preferedCardIssuer}          |
   |expected#maxCards                    |${store:payload-co.maxCards}                    |
   |expected#baseCashpoolValue           |${store:payload-co.baseCashpoolValue}           |
   |expected#baseCashpoolPercentage      |${store:payload-co.baseCashpoolPercentage}      |
   |expected#defaultDriverLimit          |${store:payload-co.defaultDriverLimit}          |
   |expected#defaultVehicleLimit         |${store:payload-co.defaultVehicleLimit}         |
   |---------------------------          |---------------------------                     |
   |expected#bankAccount#iban            |${store:payload-co.bankAccount#iban}            |
   |expected#bankAccount#viban           |${store:payload-co.bankAccount#viban}           |
   |expected#bankAccount#bic             |${store:payload-co.bankAccount#bic}             |
   |expected#bankAccount#bankName        |${store:payload-co.bankAccount#bankName}        |
   |expected#bankAccount#holder          |${store:payload-co.bankAccount#holder}          |
   |---------------------------          |---------------------------                     |
   |expected#solvency.financialDataSource|${store:payload-co.solvency.financialDataSource}|
   |expected#solvency.jitpayRating       |${store:payload-co.solvency.jitpayRating}       |
   |expected#solvency.score              |${store:payload-co.solvency.score}              |
   |expected#solvency.requestedAt        |${store:payload-co.solvency.requestedAt}        |
   |expected#solvency.externalId         |${store:payload-co.solvency.externalId}         |
   |expected#solvency.riskQuota          |${store:payload-co.solvency.riskQuota}          |
   |---------------------------          |---------------------------                     |
   |expected#validatedEmail.email        |${store:payload-co.validatedEmail.email}        |
   |expected#validatedEmail.type         |${store:payload-co.validatedEmail.type}         |
   |---------------------------          |---------------------------                     |
   |expected#addresses[0].type           |${store:payload-co.addresses[0].type}           |
   |expected#addresses[0].street         |${store:payload-co.addresses[0].street}         |
   |expected#addresses[0].city           |${store:payload-co.addresses[0].city}           |
   |expected#addresses[0].zipCode        |${store:payload-co.addresses[0].zipCode}        |
   |expected#addresses[0].countryCode    |${store:payload-co.addresses[0].countryCode}    |
   |--expected#addresses[0].addition     |${store:payload-co.addresses[0].addition}       |

## 1.6. Update a company

tags: md-26.6

* Test description

   |action     |value           |
   |-----------|----------------|
   |description|Update a company|
   |priority   |high            |

* request admin bearer

* add v2.company

* Rest call

   |action                   |value                                  |
   |-------------------------|---------------------------------------|
   |method:put               |/api/v2/company/${store:response-co.id}|
   |description              |Update a company                       |
   |---------------          |---------------                        |
   |payload                  |${store:payload-co}                    |
   |payload#id               |undefined                              |
   |payload#bankAccount.id   |${store:response-co#bankAccount.id}    |
   |payload#bankAccount.bic  |BIC                                    |
   |payload#solvency.id      |${store:response-co#solvency.id}       |
   |payload#addresses[0].id  |${store:response-co#addresses[0].id}   |
   |payload#validatedEmail.id|${store:response-co#validatedEmail.id} |
   |---------------          |---------------                        |
   |expected:header#status   |200                                    |
   |store                    |response-co                            |

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:get            |/api/company/${store:response-co.id}|
   |description           |Read the company (V1)               |
   |expected:header#status|200                                 |

* Rest call

   |action                               |value                                           |
   |-------------------------------------|------------------------------------------------|
   |method:get                           |/api/v2/company/${store:response-co.id}         |
   |description                          |Read the company (V2)                           |
   |expected:header#status               |200                                             |
   |---------------                      |---------------                                 |
   |expected#referenceId                 |${store:payload-co.referenceId}                 |
   |expected#henriContactId              |${store:payload-co.henriContactId}              |
   |expected#vatId                       |${store?:payload-co.vatId}                      |
   |expected#taxNumber                   |${store:payload-co.taxNumber}                   |
   |expected#name                        |${store:payload-co.name}                        |
   |expected#legalForm                   |${store:payload-co.legalForm}                   |
   |expected#status                      |${store:payload-co.status}                      |
   |expected#originPlatform              |${store:payload-co.originPlatform}              |
   |expected#originSource                |${store:payload-co.originSource}                |
   |expected#registryCourt               |${store:payload-co.registryCourt}               |
   |expected#commercialRegisterNr        |${store:payload-co.commercialRegisterNr}        |
   |expected#homePage                    |${store:payload-co.homePage}                    |
   |expected#salesManager                |${store:payload-co.salesManager}                |
   |expected#currency                    |${store:payload-co.currency}                    |
   |expected#initialPin                  |${store:payload-co.initialPin}                  |
   |expected#preferedCardIssuer          |${store:payload-co.preferedCardIssuer}          |
   |expected#maxCards                    |${store:payload-co.maxCards}                    |
   |expected#baseCashpoolValue           |${store:payload-co.baseCashpoolValue}           |
   |expected#baseCashpoolPercentage      |${store:payload-co.baseCashpoolPercentage}      |
   |expected#defaultDriverLimit          |${store:payload-co.defaultDriverLimit}          |
   |expected#defaultVehicleLimit         |${store:payload-co.defaultVehicleLimit}         |
   |expected#bankAccount.iban            |${store:payload-co.bankAccount#iban}            |
   |expected#bankAccount.viban           |${store:payload-co.bankAccount#viban}           |
   |expected#bankAccount.bic             |BIC                                             |
   |expected#bankAccount.bankName        |${store:payload-co.bankAccount#bankName}        |
   |expected#bankAccount.holder          |${store:payload-co.bankAccount#holder}          |
   |expected#solvency.financialDataSource|${store:payload-co.solvency.financialDataSource}|
   |expected#solvency.jitpayRating       |${store:payload-co.solvency.jitpayRating}       |
   |expected#solvency.score              |${store:payload-co.solvency.score}              |
   |expected#solvency.requestedAt        |${store:payload-co.solvency.requestedAt}        |
   |expected#solvency.externalId         |${store:payload-co.solvency.externalId}         |
   |expected#solvency.riskQuota          |${store:payload-co.solvency.riskQuota}          |
   |expected#validatedEmail.email        |${store:payload-co.validatedEmail.email}        |
   |expected#validatedEmail.type         |${store:payload-co.validatedEmail.type}         |
   |expected#addresses[0].type           |${store:payload-co.addresses[0].type}           |
   |expected#addresses[0].street         |${store:payload-co.addresses[0].street}         |
   |expected#addresses[0].city           |${store:payload-co.addresses[0].city}           |
   |expected#addresses[0].zipCode        |${store:payload-co.addresses[0].zipCode}        |
   |expected#addresses[0].countryCode    |${store:payload-co.addresses[0].countryCode}    |
   |--expected#addresses[0].addition     |${store:payload-co.addresses[0].addition}       |

## 1.7. Delete a company

tags: md-26.7

* Test description

   |action     |value           |
   |-----------|----------------|
   |description|Delete a company|
   |priority   |high            |

* request admin bearer

* add v2.company

* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:delete         |/api/v2/company/${store:response-co.id}|
   |description           |Delete a company                       |
   |---------------       |---------------                        |
   |expected:header#status|204                                    |

## 1.8. Check Events

tags: md-26.8, event

* Test description

   |action     |value                     |
   |-----------|--------------------------|
   |description|Check events for a company|
   |           |* create                  |
   |           |* update                  |
   |           |* delete                  |
   |priority   |high                      |

* request admin bearer

* RabbitMQ bind

   |action     |value                             |
   |-----------|----------------------------------|
   |exchange   |masterdata                        |
   |queue      |test.md                           |
   |description|Bind masterdata/company crud event|

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* payload company

* RabbitMQ publish

   |action           |value                                   |
   |-----------------|----------------------------------------|
   |description      |CREATE: Publish onboarding event manualy|
   |group            |Check Queues (CREATE)                   |
   |exchange         |masterdata.update                       |
   |routing          |company                                 |
   |payload          |${store:payload-co}                     |
   |header#eventClass|Company                                 |
   |header#eventType |Create                                  |

* RabbitMQ consume, continue

   |action                                |value                              |
   |--------------------------------------|-----------------------------------|
   |queue                                 |test.md                            |
   |description                           |CREATE: Company Event must be fired|
   |group                                 |Check Queues (CREATE)              |
   |count:max                             |2                                  |
   |count:min                             |2                                  |
   |expected:header#[0].headers.eventClass|Company                            |
   |expected:header#[0].headers.eventType |CREATE                             |

* Rest call

   |action                |value                                 |
   |----------------------|--------------------------------------|
   |method:get            |/api/v2/company/${store:payload-co#id}|
   |description           |CREATE: Read the Company              |
   |group                 |Check Queues (CREATE)                 |
   |expected:header#status|200                                   |
   |store                 |response-co                           |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@
@    @ @    @ @    @  @  @    @   @
@    @ @    @ @    @ @    @   @   @@@@@
@    @ @@@@@  @    @ @@@@@@   @   @
@    @ @      @    @ @    @   @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@

* RabbitMQ publish

   |action                   |value                                        |
   |-------------------------|---------------------------------------------|
   |description              |UPDATE: Publish Company updated event manualy|
   |group                    |Check Queues (UPDATE)                        |
   |exchange                 |masterdata.update                            |
   |routing                  |company                                      |
   |---------------          |---------------                              |
   |payload                  |${store:payload-co}                          |
   |payload#bankAccount.id   |${store:response-co#bankAccount.id}          |
   |payload#bankAccount.bic  |BIC                                          |
   |payload#solvency.id      |${store:response-co#solvency.id}             |
   |payload#addresses[0].id  |${store:response-co#addresses[0].id}         |
   |payload#validatedEmail.id|${store:response-co#validatedEmail.id}       |
   |---------------          |---------------                              |
   |header#eventClass        |Company                                      |
   |header#eventType         |Update                                       |

* RabbitMQ consume, continue

   |action                                |value                              |
   |--------------------------------------|-----------------------------------|
   |queue                                 |test.md                            |
   |description                           |UPDATE: Company Event must be fired|
   |group                                 |Check Queues (UPDATE)              |
   |count:max                             |2                                  |
   |count:min                             |2                                  |
   |expected:header#[0].headers.eventClass|Company                            |
   |expected:header#[0].headers.eventType |UPDATE                             |
   |expected#[0].bankAccount.bic          |BIC                                |
   |expected#[1].bankAccount.bic          |BIC                                |

* Rest call

   |action                  |value                                 |
   |------------------------|--------------------------------------|
   |method:get              |/api/v2/company/${store:payload-co#id}|
   |description             |UPDATE: Read the Company              |
   |group                   |Check Queues (UPDATE)                 |
   |expected:header#status  |200                                   |
   |expected#bankAccount.bic|BIC                                   |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@

* RabbitMQ publish

   |action           |value                                           |
   |-----------------|------------------------------------------------|
   |description      |DELETE: Publish onboarding updated event manualy|
   |group            |Check Queues (DELETE)                           |
   |exchange         |masterdata.update                               |
   |routing          |company                                         |
   |payload#id       |${store:payload-co#id}                          |
   |header#eventClass|Company                                         |
   |header#eventType |Delete                                          |

* RabbitMQ consume, continue

   |action                                |value                              |
   |--------------------------------------|-----------------------------------|
   |queue                                 |test.md                            |
   |description                           |DELETE: Company Event must be fired|
   |group                                 |Check Queues (DELETE)              |
   |count:max                             |2                                  |
   |count:min                             |2                                  |
   |expected:header#[0].headers.eventClass|Company                            |
   |expected:header#[0].headers.eventType |DELETE                             |
   |expected#[0].id                       |${store:payload-co#id}             |

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:get            |/api/v2/company/${store:payload-co#id}              |
   |description           |DELETE: Read the Company, but it must be deleted now|
   |group                 |Check Queues (DELETE)                               |
   |expected:header#status|404                                                 |

## 1.9. Check Event Consuming Error

tags: md-26.9, event

* Test description

   |action     |value                                             |
   |-----------|--------------------------------------------------|
   |description|Errors must be processed by the death letter queue|
   |priority   |high                                              |

* RabbitMQ bind

   |action     |value                             |
   |-----------|----------------------------------|
   |exchange   |masterdata.error                  |
   |queue      |test.md.error                     |
   |description|Bind masterdata death letter queue|

* RabbitMQ publish

   |action           |value                                            |
   |-----------------|-------------------------------------------------|
   |description      |Publish deletion without id updated event manualy|
   |exchange         |masterdata.update                                |
   |routing          |company                                          |
   |payload#-id-     |xxxxx                                            |
   |header#eventClass|Company                                          |
   |header#eventType |Delete                                           |

* RabbitMQ consume, continue

   |action       |value                           |
   |-------------|--------------------------------|
   |queue        |test.md.error                   |
   |description  |Death letter Event must be fired|
   |expected#-id-|xxxxx                           |
