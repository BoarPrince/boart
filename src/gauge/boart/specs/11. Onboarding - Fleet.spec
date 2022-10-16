# 1. Onboarding Fleet

tags: env-all, onboarding, ob-11

## 1.1. Add a company via MasterData Rest API

tags: ob-11.1

* Test description

   |action     |value                                    |
   |-----------|-----------------------------------------|
   |description|Add a company via MasterData Rest API    |
   |           |And check if this company exists in Fleet|
   |priority   |high                                     |

* bind onboarding queues

* request admin bearer

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/company                                        |
   |description           |Create a Company (send post request)                |
   |payload               |<file:company-with-carrier-without-ids-request.json>|
   |expected:header#status|200                                                 |
   |store#id              |companyId                                           |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/company/${store:companyId}              |
   |description           |Check if newly added company can be requested|
   |expected:header#status|200                                          |

* check master data queues

* check error queues

* Rest call

   |action                |value                                                          |
   |----------------------|---------------------------------------------------------------|
   |method:get            |/api/masterdata/subsidiary/${store:companyId}                  |
   |description           |Check JITfleet Masterdata. Carrier (Subsidiary must be created)|
   |expected:header#status|200                                                            |

## 1.2. Read Event from Onboarding Service once the first time

tags: ob-11.2

* Test description

   |action     |value                                                     |
   |-----------|----------------------------------------------------------|
   |description|Check that onboarding event can be consumed while creating|
   |priority   |high                                                      |

* RabbitMQ bind

   |action     |value                                                  |
   |-----------|-------------------------------------------------------|
   |exchange   |fleet.masterdata.error.exchange                        |
   |description|Bind all queues                                        |
   |           |Binds all error queues to check if an error has occured|
   |queue      |test.fleet.masterdata.error                            |
   |routing    |fleet.masterdata.company.error                         |
   |routing    |fleet.masterdata.carrier.error                         |
   |routing    |fleet.masterdata.user.error                            |

* create company event after onboarding, store: "company_event_after_onboarding"

* bind onboarding queues

* RabbitMQ publish

   |action           |value                                                              |
   |-----------------|-------------------------------------------------------------------|
   |exchange         |carrier                                                            |
   |group            |Send Events to MasterData (Consuming by Fleet)                     |
   |description      |Send Carrier Event (MD) to Exchange (event after onboarding)       |
   |                 |Simulation sending carrier event the Master Data "Carrier" exchange|
   |header#eventDate |${store:company_event_after_onboarding#eventDate}                  |
   |header#eventId   |${store:company_event_after_onboarding#eventId}                    |
   |header#eventType |UPDATE                                                             |
   |payload          |${store:company_event_after_onboarding#carriers#0}                 |
   |payload#eventDate|${store:company_event_after_onboarding#eventDate}                  |
   |payload#eventId  |${store:company_event_after_onboarding#eventId}                    |
   |payload#eventType|UPDATE                                                             |

* check error queues

* request admin bearer

* Rest call

   |action                |value                                                          |
   |----------------------|---------------------------------------------------------------|
   |method:get            |/api/masterdata/subsidiary/${store:ob_info#companyId}          |
   |description           |Check JITfleet Masterdata. Carrier (Subsidiary must be created)|
   |expected:header#status|200                                                            |

