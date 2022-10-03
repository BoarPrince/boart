# 1. Onboarding Fleet

tags: env-all, queue, onboarding, ob-10.2

## 1.1. Read Event from Onboarding Service once the first time

tags: ob-10.2-1, env-local

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

* RabbitMQ publish

   |action           |value                                                              |
   |-----------------|-------------------------------------------------------------------|
   |exchange         |company                                                            |
   |group            |Send Events to MasterData (Consuming by Fleet)                     |
   |description      |Send Company Event (MD) to Exchange (event after onboarding)       |
   |                 |Simulation sending company event the Master Data "Company" exchange|
   |header#eventDate |${store:company_event_after_onboarding#eventDate}                  |
   |header#eventId   |${store:company_event_after_onboarding#eventId}                    |
   |header#eventType |${store:company_event_after_onboarding#eventType}                  |
   |payload          |${store:company_event_after_onboarding}                            |
   |payload#eventDate|${store:company_event_after_onboarding#eventDate}                  |
   |payload#eventId  |${store:company_event_after_onboarding#eventId}                    |
   |payload#eventType|${store:company_event_after_onboarding#eventType}                  |

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

* RabbitMQ consume

   |action     |value                                                                        |
   |-----------|-----------------------------------------------------------------------------|
   |queue      |test.fleet.masterdata.error                                                  |
   |description|Check Fleet MasterData Error queue                                           |
   |           |All fleet death letter exchanges are bound to this queue                     |
   |           |No error should occur while consuming the Master Data creation/update events.|
   |           |Therefore the queue must be empty                                            |
   |timeout    |5                                                                            |
   |count:max  |0                                                                            |
   |count:min  |0                                                                            |

* request admin bearer

* Rest call

   |action                |value                                                          |
   |----------------------|---------------------------------------------------------------|
   |method:get            |/api/masterdata/subsidiary/${store:ob_info#companyId}          |
   |description           |Check JITfleet Masterdata. Carrier (Subsidiary must be created)|
   |expected:header#status|200                                                            |

