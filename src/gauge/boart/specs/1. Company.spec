# 1. Company - MasterData

tags: env-all, master-data, md-1

## 1.1. Add a company

tags: md-1.1

* Test description
      | action      | value                                              |
      |-------------|----------------------------------------------------|
      | description | Check if a company can be created via the rest api |
      |             | And can be loaded afterwards via rest api          |
      | priority    | high                                               |

* request admin bearer

* Rest call
      | action                 | value                                                |
      |------------------------|------------------------------------------------------|
      | method:post            | /api/company                                         |
      | description            | Create a Company (send post request)                 |
      | payload                | <file:company-with-carrier-without-ids-request.json> |
      | expected:header#status | 200                                                  |
      | store#id               | companyId                                            |

* Rest call
      | action                 | value                                         |
      |------------------------|-----------------------------------------------|
      | method:get             | /api/company/${store:companyId}               |
      | description            | Check if newly added company can be requested |
      | expected:header#status | 200                                           |

## 1.2. Update a company

tags: md-1.2

* Test description
      | action      | value                                              |
      |-------------|----------------------------------------------------|
      | description | Check if a company can be created via the rest api |
      |             | And can be loaded afterwards via rest api          |
      | priority    | high                                               |

* request admin bearer

* Rest call
      | action                 | value                                                |
      |------------------------|------------------------------------------------------|
      | method:post            | /api/company                                         |
      | description            | Create a Company (send post request)                 |
      | payload                | <file:company-with-carrier-without-ids-request.json> |
      | expected:header#status | 200                                                  |
      | store                  | response                                             |

* Rest call
      | action                 | value                              |
      |------------------------|------------------------------------|
      | method:put             | /api/company/${store:response.id}  |
      | payload                | ${store:response}                  |
      | payload#companyName    | x-x-x                              |
      | description            | Update previously created commpany |
      | expected:header#status | 200                                |

* Rest call
      | action                 | value                                         |
      |------------------------|-----------------------------------------------|
      | method:get             | /api/company/${store:response.id}             |
      | description            | Check if newly added company can be requested |
      | expected:header#status | 200                                           |
      | expected#companyName   | x-x-x                                         |

## 1.3. Update a company with another id

tags: md-1.3

* Test description
      | action      | value                                 |
      |-------------|---------------------------------------|
      | description | Check updating a company with another |
      | priority    | high                                  |

* request admin bearer

* Rest call
      | action                 | value                                                |
      |------------------------|------------------------------------------------------|
      | method:post            | /api/company                                         |
      | description            | Create first Company                                 |
      | payload                | <file:company-with-carrier-without-ids-request.json> |
      | payload#companyName    | first company ${context:payload#companyName}         |
      | expected:header#status | 200                                                  |
      | store                  | response1                                            |

* Rest call
      | action                 | value                                                |
      |------------------------|------------------------------------------------------|
      | method:post            | /api/company                                         |
      | description            | Create second Company                                |
      | payload                | <file:company-with-carrier-without-ids-request.json> |
      | payload#companyName    | second company                                       |
      | expected:header#status | 200                                                  |
      | store                  | response2                                            |

* Rest call
      | action                  | value                                                |
      |-------------------------|------------------------------------------------------|
      | method:get              | /api/company/${store:response1.id}                   |
      | description             | Check before updating if Carrier is the expected one |
      | expected:header#status  | 200                                                  |
      | expected#carriers[0].id | ${store:response1.carriers[0].id}                    |

* Rest call
      | action                 | value                                          |
      |------------------------|------------------------------------------------|
      | method:get             | /api/carrier/${store:response1.carriers[0].id} |
      | description            | Load lost carrier before Updating              |
      | expected:header#status | 200                                            |

* Rest call
      | action                 | value                                                  |
      |------------------------|--------------------------------------------------------|
      | method:put             | /api/company/${store:response1.id}                     |
      | description            | Update first Company with payload id of second Company |
      | payload                | ${store:response1}                                     |
      | payload#id             | ${store:response2.id}                                  |
      | expected:header#status | 409                                                    |
      | expected#message       | id in payload does not match path id                   |

comment * Rest call
comment       | action                 | value                                          |
comment       |------------------------|------------------------------------------------|
comment       | method:get             | /api/carrier/${store:response1.carriers[0].id} |
comment       | description            | Load lost carrier after Updating               |
comment       | expected:header#status | 200                                            |
comment
comment * Rest call
comment       | action                       | value                                                    |
comment       |------------------------------|----------------------------------------------------------|
comment       | method:get                   | /api/company/${store:response1.id}                       |
comment       | description                  | Check if Carrier is still the same for the first Company |
comment       | expected:header#status       | 200                                                      |
comment       | expected:data:count#carriers | 1                                                        |
comment       | expected#carriers[0].id      | ${store:response1.carriers[0].id}                        |
