# 1. Company - MasterData

tags: env-all, master-data, md-1

## 1.1. Add a company

tags: md-1.1

* Test description

   |action     |value                                             |
   |-----------|--------------------------------------------------|
   |description|Check if a company can be created via the rest api|
   |           |And can be loaded afterwards via rest api         |
   |priority   |high                                              |

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

## 1.2. Update a company

tags: md-1.2

* Test description

   |action     |value                                             |
   |-----------|--------------------------------------------------|
   |description|Check if a company can be created via the rest api|
   |           |And can be loaded afterwards via rest api         |
   |priority   |high                                              |

* request admin bearer

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/company                                        |
   |description           |Create a Company (send post request)                |
   |payload               |<file:company-with-carrier-without-ids-request.json>|
   |expected:header#status|200                                                 |
   |store                 |response                                            |

* Rest call

   |action                |value                             |
   |----------------------|----------------------------------|
   |method:put            |/api/company/${store:response.id} |
   |payload               |${store:response}                 |
   |payload#companyName   |x-x-x                             |
   |description           |Update previously created commpany|
   |expected:header#status|200                               |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/company/${store:response.id}            |
   |description           |Check if newly added company can be requested|
   |expected:header#status|200                                          |
   |expected#companyName  |x-x-x                                        |

## 1.3. Update a company with another id

tags: md-1.3

* Test description

   |action     |value                                |
   |-----------|-------------------------------------|
   |description|Check updating a company with another|
   |priority   |high                                 |

* request admin bearer

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/company                                        |
   |description           |Create first Company                                |
   |payload               |<file:company-with-carrier-without-ids-request.json>|
   |payload#companyName   |first company ${context:payload#companyName}        |
   |expected:header#status|200                                                 |
   |store                 |response1                                           |

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/company                                        |
   |description           |Create second Company                               |
   |payload               |<file:company-with-carrier-without-ids-request.json>|
   |payload#companyName   |second company                                      |
   |expected:header#status|200                                                 |
   |store                 |response2                                           |

* Rest call

   |action                 |value                                               |
   |-----------------------|----------------------------------------------------|
   |method:get             |/api/company/${store:response1.id}                  |
   |description            |Check before updating if Carrier is the expected one|
   |expected:header#status |200                                                 |
   |expected#carriers[0].id|${store:response1.carriers[0].id}                   |

* Rest call

   |action                |value                                         |
   |----------------------|----------------------------------------------|
   |method:get            |/api/carrier/${store:response1.carriers[0].id}|
   |description           |Load lost carrier before Updating             |
   |expected:header#status|200                                           |

* Rest call

   |action                |value                                                 |
   |----------------------|------------------------------------------------------|
   |method:put            |/api/company/${store:response1.id}                    |
   |description           |Update first Company with payload id of second Company|
   |payload               |${store:response1}                                    |
   |payload#id            |${store:response2.id}                                 |
   |expected:header#status|409                                                   |
   |expected#message      |id in payload does not match path id                  |

## 1.4. Text search company name (/api/companysearchString=abc)

tags: company-search, md-1-4

* Test description

   |action     |value                                                   |
   |-----------|--------------------------------------------------------|
   |description|Check that a company can be searched by the company name|
   |ticket     |adesso:JIT-401                                          |
   |priority   |medium                                                  |

* add company and carrier

* Rest call

   |action                         |value                           |
   |-------------------------------|--------------------------------|
   |method:get                     |/api/company                    |
   |description                    |Search company by name          |
   |query#size                     |100                             |
   |query#searchString             |${store:response-co#companyName}|
   |expected:header#status         |200                             |
   |expected:count#content         |1                               |
   |expected#content[0].id         |${store:response-co#id}         |
   |expected#content[0].companyName|${store:response-co#companyName}|

## 1.5. Text search company jitpayId (/api/companysearchString=abc)

tags: company-search, md-1-4

* Test description

   |action     |value                                                       |
   |-----------|------------------------------------------------------------|
   |description|Check that a company can be searched by the company jitPayId|
   |ticket     |adesso:JIT-401                                              |
   |priority   |medium                                                      |

* add company and carrier

* Rest call

   |action                      |value                        |
   |----------------------------|-----------------------------|
   |method:get                  |/api/company                 |
   |description                 |Search company by jitpayId   |
   |query#size                  |100                          |
   |query#searchString          |${store:response-co#jitPayId}|
   |expected:header#status      |200                          |
   |expected:count#content      |1                            |
   |expected#content[0].id      |${store:response-co#id}      |
   |expected#content[0].jitPayId|${store:response-co#jitPayId}|

## 1.6. Check queue event (creationDate, modifiedDate)

tags: company-create-event, md-1-9

* Test description

   |action     |value                                                                             |
   |-----------|----------------------------------------------------------------------------------|
   |description|Check event when creating a company (creationDate and modifiedDate cannot be null)|
   |priority   |medium                                                                            |

* queues bind "company"

* request admin bearer

* add company, response: "response-co"

* queues check "company"

* Data manage

   |action                         |value                 |
   |-------------------------------|----------------------|
   |in                             |${store:event-company}|
   |expected:not:empty#createDate  |                      |
   |expected:not:empty#modifiedDate|                      |
