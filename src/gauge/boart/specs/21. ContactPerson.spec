# 1. ContactPerson - MasterData

tags: env-all, master-data, masterdata, md-20, contact-person, v2

## 1.1. Add a Contact Person (without Address and without PhoneNumbers)

tags: md-20.1

* Test description

   |action     |value                                      |
   |-----------|-------------------------------------------|
   |description|Add a new Contact Person without an address|
   |priority   |high                                       |

* request admin bearer

* Rest call

   |action                |value                                                                |
   |----------------------|---------------------------------------------------------------------|
   |method:post           |/api/v2/contactPerson                                                |
   |description           |Creates a ContactPerson without an associated Address and Phonenumber|
   |payload#type          |type1                                                                |
   |payload#email         |email                                                                |
   |payload#lastName      |last                                                                 |
   |payload#firstName     |first                                                                |
   |payload#languageCode  |DK                                                                   |
   |expected:header#status|200                                                                  |
   |store#id              |contactPersonId                                                      |

* Rest call

   |action                |value                                         |
   |----------------------|----------------------------------------------|
   |method:get            |/api/v2/contactPerson/${store:contactPersonId}|
   |description           |Read the previosly created contact person     |
   |expected:header#status|200                                           |
   |expected#type         |type1                                         |
   |expected#email        |email                                         |
   |expected#lastName     |last                                          |
   |expected#firstName    |first                                         |
   |expected#addresses    |[]                                            |
   |expected#phoneNumbers |[]                                            |
   |expected#languageCode |DK                                            |

## 1.2. Add a Contact Person (with Address and without PhoneNumbers)

tags: md-20.2

* Test description

   |action     |value                                                         |
   |-----------|--------------------------------------------------------------|
   |description|Add a new Contact Person with an address, but no phone numbers|
   |priority   |high                                                          |

* request admin bearer

* Rest call

   |action                |value                                |
   |----------------------|-------------------------------------|
   |method:post           |/api/v2/address                      |
   |description           |Creates an Address with random values|
   |payload#type          |${generate:char:30}                  |
   |payload#street        |${generate:fake:address:street}      |
   |payload#city          |${generate:fake:address:city}        |
   |payload#zipCode       |${generate:random:10}                |
   |payload#countryCode   |${generate:fake:address:countryCode} |
   |payload#addition      |${generate:char:100}                 |
   |expected:header#status|200                                  |
   |store#id              |addressId                            |

* Rest call

   |action                |value                                                                |
   |----------------------|---------------------------------------------------------------------|
   |method:post           |/api/v2/contactPerson                                                |
   |description           |Creates a ContactPerson with an associated Address and no Phonenumber|
   |payload#type          |type1                                                                |
   |payload#email         |email                                                                |
   |payload#lastName      |last                                                                 |
   |payload#firstName     |first                                                                |
   |payload#languageCode  |DK                                                                   |
   |payload#addresses[0]  |${store:addressId}                                                   |
   |expected:header#status|200                                                                  |
   |store#id              |contactPersonId                                                      |

* Rest call

   |action                |value                                         |
   |----------------------|----------------------------------------------|
   |method:get            |/api/v2/contactPerson/${store:contactPersonId}|
   |description           |Read the previosly created contact person     |
   |expected:header#status|200                                           |
   |expected#type         |type1                                         |
   |expected#email        |email                                         |
   |expected#lastName     |last                                          |
   |expected#firstName    |first                                         |
   |expected#addresses[0] |${store:addressId}                            |
   |expected#phoneNumbers |[]                                            |
   |expected#languageCode |DK                                            |

## 1.3. Add a Contact Person (with Addresses and PhoneNumbers)

tags: md-20.3

* Test description

   |action     |value                                                           |
   |-----------|----------------------------------------------------------------|
   |description|Add a new Contact Person with an address and with a phone number|
   |priority   |high                                                            |

* request admin bearer

* Rest call

   |action                                  |value                                                                |
   |----------------------------------------|---------------------------------------------------------------------|
   |method:post                             |/api/v2/contactPerson                                                |
   |description                             |Creates a ContactPerson with an associated Address and no Phonenumber|
   |payload#type                            |type1                                                                |
   |payload#email                           |email                                                                |
   |payload#lastName                        |last                                                                 |
   |payload#firstName                       |first                                                                |
   |payload#languageCode                    |DK                                                                   |
   |payload#phoneNumbers[0].number          |1743284130                                                           |
   |payload#phoneNumbers[0].countryPhoneCode|49                                                                   |
   |expected:header#status                  |200                                                                  |
   |store#id                                |contactPersonId                                                      |

* Rest call

   |action                                   |value                                         |
   |-----------------------------------------|----------------------------------------------|
   |method:get                               |/api/v2/contactPerson/${store:contactPersonId}|
   |description                              |Read the previosly created contact person     |
   |expected:header#status                   |200                                           |
   |expected#type                            |type1                                         |
   |expected#email                           |email                                         |
   |expected#lastName                        |last                                          |
   |expected#firstName                       |first                                         |
   |expected#addresses                       |[]                                            |
   |expected:count#phoneNumbers              |1                                             |
   |expected#phoneNumbers[0].number          |1743284130                                    |
   |expected#phoneNumbers[0].countryPhoneCode|49                                            |
   |expected#languageCode                    |DK                                            |

## 1.4. Add a Contact Person with wrong PhoneNumber must throw a correct error

tags: md-20.4

* Test description

   |action     |value                                                                               |
   |-----------|------------------------------------------------------------------------------------|
   |description|Add a new Contact Person with a wrong defined PhoneNumber must occur a correct error|
   |priority   |high                                                                                |

* request admin bearer

* Rest call

   |action                                  |value                                                                |
   |----------------------------------------|---------------------------------------------------------------------|
   |method:post                             |/api/v2/contactPerson                                                |
   |description                             |Creates a ContactPerson with an associated Address and no Phonenumber|
   |payload#type                            |type1                                                                |
   |payload#email                           |email                                                                |
   |payload#lastName                        |last                                                                 |
   |payload#firstName                       |first                                                                |
   |payload#languageCode                    |DK                                                                   |
   |payload#phoneNumbers[0].number          |1743284130                                                           |
   |payload#phoneNumbers[0].countryPhoneCode|DE                                                                   |
   |expected:header#status                  |406                                                                  |
   |expected#status                         |406                                                                  |
   |expected:startsWith#detail              |{phoneNumbers[0].countryPhoneCode=only european (Zones 3–4)          |

## 1.5. Find a Contact Person by searching

tags: md-20.5

* Test description

   |action     |value                                               |
   |-----------|----------------------------------------------------|
   |description|Checks if a Contact Person can be found by searching|
   |priority   |high                                                |

* request admin bearer

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:post           |/api/v2/contactPerson                     |
   |description           |Creates a ContactPerson with random values|
   |payload#type          |${generate:char:20}                       |
   |payload#email         |${generate:fake:internet:email}           |
   |payload#lastName      |${generate:fake:name:lastName}            |
   |payload#firstName     |${generate:fake:name:firstName}           |
   |payload#languageCode  |${generate:char:2}                        |
   |expected:header#status|200                                       |
   |store:payload         |contactPersonPayload                      |

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by Type -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                  |value                             |
   |------------------------|----------------------------------|
   |description             |Search contact person by type     |
   |method:get              |/api/v2/contactPerson             |
   |query#searchString      |${store:contactPersonPayload.type}|
   |expected:header#status  |200                               |
   |expected:count#content  |1                                 |
   |expected#content[0].type|${store:contactPersonPayload.type}|

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by Email -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                   |value                              |
   |-------------------------|-----------------------------------|
   |description              |Search contact person by email     |
   |method:get               |/api/v2/contactPerson              |
   |query#searchString       |${store:contactPersonPayload.email}|
   |expected:header#status   |200                                |
   |expected:count#content   |1                                  |
   |expected#content[0].email|${store:contactPersonPayload.email}|

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by LastName -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                      |value                                 |
   |----------------------------|--------------------------------------|
   |description                 |Search contact person by lastName     |
   |method:get                  |/api/v2/contactPerson                 |
   |query#searchString          |${store:contactPersonPayload.lastName}|
   |expected:header#status      |200                                   |
   |expected:count#content      |1                                     |
   |expected#content[0].lastName|${store:contactPersonPayload.lastName}|

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by FirstName -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                       |value                                  |
   |-----------------------------|---------------------------------------|
   |description                  |Search contact person by firstName     |
   |method:get                   |/api/v2/contactPerson                  |
   |query#searchString           |${store:contactPersonPayload.firstName}|
   |expected:header#status       |200                                    |
   |expected:count#content       |1                                      |
   |expected#content[0].firstName|${store:contactPersonPayload.firstName}|

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by LanguageCode -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                          |value                                     |
   |--------------------------------|------------------------------------------|
   |description                     |Search contact person by languageCode     |
   |method:get                      |/api/v2/contactPerson                     |
   |query#searchString              |${store:contactPersonPayload.languageCode}|
   |expected:header#status          |200                                       |
   |expected:greater#content        |0                                         |
   |expected#content[0].languageCode|${store:contactPersonPayload.languageCode}|

## 1.6. Find a Contact Person by searching with Address

tags: md-20.6

* Test description

   |action     |value                                                                             |
   |-----------|----------------------------------------------------------------------------------|
   |description|Checks if a Contact Person can be found by searching when an address is associated|
   |priority   |high                                                                              |

* request admin bearer

* Rest call

   |action                |value                                             |
   |----------------------|--------------------------------------------------|
   |method:post           |/api/v2/address                                   |
   |description           |Creates an Address with random values             |
   |payload#type          |${generate:char:30}                               |
   |payload#street        |${generate:fake:address:street}                   |
   |payload#city          |${generate:fake:address:city}-${generate:random:8}|
   |payload#zipCode       |${generate:random:10}                             |
   |payload#countryCode   |${generate:fake:address:countryCode}              |
   |payload#addition      |${generate:char:100}                              |
   |expected:header#status|200                                               |
   |store:payload         |addressPayload                                    |
   |store#id              |addressId                                         |

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:post           |/api/v2/contactPerson                     |
   |description           |Creates a ContactPerson with random values|
   |payload#type          |${generate:char:20}                       |
   |payload#email         |${generate:fake:internet:email}           |
   |payload#lastName      |${generate:fake:name:lastName}            |
   |payload#firstName     |${generate:fake:name:firstName}           |
   |payload#languageCode  |${generate:char:2}                        |
   |payload#addresses[0]  |${store:addressId}                        |
   |expected:header#status|200                                       |
   |store:payload         |contactPersonPayload                      |

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by City -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                  |value                                |
   |------------------------|-------------------------------------|
   |description             |Search contact person by address city|
   |method:get              |/api/v2/contactPerson                |
   |query#searchString      |${store:addressPayload.city}         |
   |expected:header#status  |200                                  |
   |expected:greater#content|0                                    |

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by ZipCode -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                  |value                                   |
   |------------------------|----------------------------------------|
   |description             |Search contact person by address zipCode|
   |method:get              |/api/v2/contactPerson                   |
   |query#searchString      |${store:addressPayload.zipCode}         |
   |expected:header#status  |200                                     |
   |expected:greater#content|0                                       |
