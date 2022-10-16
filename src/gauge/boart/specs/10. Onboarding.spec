# 1. Onboarding Fleet

tags: env-all, onboarding, ob-10

## 1.1. Register a new Company

tags: ob-10.1

* Test description

   |action     |value                 |
   |-----------|----------------------|
   |description|Register a new Company|
   |           |and.....              |
   |priority   |high                  |

* onboarding - register

* onboarding - change password "${store:response-register.companyId}", username: "${store:response-register.email}", password: "${store:response-register.password}", new-password: "${env:default_password}"

* onboarding - request user bearer, username: "${store:response-register.email}", password: "${env:default_password}"

* onboarding - update company

* onboarding - update bank

* onboarding - update representative

* onboarding - accept contract and condition

* onboarding - start video legimitation
