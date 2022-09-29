# 1. Onboarding Fleet --10.2--

tags: env-all, queue, onboarding, ob-10.2

## 1.1. Read Event from Onboarding Service once the first time

tags: ob-10.2-1, env-local

* Test description

   |action     |value                                                     |
   |-----------|----------------------------------------------------------|
   |description|Check that onboarding event can be consumed while creating|
   |priority   |high                                                      |

* RabbitMQ bind

   |action     |value                          |
   |-----------|-------------------------------|
   |exchange   |fleet.masterdata.error.exchange|
   |description|Bind all queues                |
   |queue      |test.fleet.masterdata.error    |
   |routing    |fleet.masterdata.company.error |
   |routing    |fleet.masterdata.carrier.error |
   |routing    |fleet.masterdata.user.error    |

* create company event after onboarding, store: "company_event_after_onboarding"

Print store

* RabbitMQ publish

   |action     |value                                                  |
   |-----------|-------------------------------------------------------|
   |exchange   |company                                                |
   |description|Send Company Event to Exchange (event after onboarding)|
   |payload    |${store:company_event_after_onboarding}                |

* RabbitMQ publish

   |action     |value                                                  |
   |-----------|-------------------------------------------------------|
   |exchange   |carrier                                                |
   |description|Send Carrier Event to Exchange (event after onboarding)|
   |payload    |${store:company_event_after_onboarding#carriers#0}     |

* RabbitMQ consume, continue

   |action     |value                      |
   |-----------|---------------------------|
   |queue      |test.fleet.masterdata.error|
   |description|Error queue must be empty  |
   |count:max  |0                          |

* request admin bearer

* Rest call

   |action                |value                                                |
   |----------------------|-----------------------------------------------------|
   |method:get            |/api/masterdata/subsidiary/${store:ob_info#companyId}|
   |description           |Carrier (Subsidiary must be created)                 |
   |expected:header#status|200                                                  |

