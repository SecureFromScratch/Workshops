# The Challenges
--------------------------
**You can:** 
* Try by yourself
* Use GenAI
* Use the walk-through: walkthroughs/*

---------------------------

## Preparations

Go to the README for Installation and sanity test


---------------------------



## Uncontrolled Resource Consumption 
  
  CWE 400
  
  Attackers trigger excessive use of CPU, memory, disk, or bandwidth—leading to DoS.

  Fix the getItemsByCriteria to prevent Uncontrolled Resource Consumption 


---------------------------

## Unrestricted File Upload
  
  CWE 434
  
  The product allows the upload or transfer of dangerous file types that are automatically processed within its environment.

  Create the /create-with-file endpoint to add an item with a picture uploaded from the user’s machine


---------------------------

## SSRF 

  CWE 918

  * An attacker manipulates a server to make unintended or unauthorized HTTP requests.
  * These requests are initiated from the vulnerable server, and the attacker can often control the target of the request (e.g., a URL or IP address)
  * SSRF exploits the trust a server has in its internal network or other external systems

  Fix the SSRF vulnerability in the create method

----------------------------

## Race Condition

 "The product checks the state of a resource before using that resource, but the resource's state can change between the check and the use in a way that invalidates the results of the check. This can cause the product to perform invalid actions when the resource is in an unexpected state." 

  CWE 367 

  The API allows users to apply a coupon code  but it fails to properly handle concurrent requests. The logic checks if the coupon is unused, then applies the it— but these steps are not atomic.
  As a result, a malicious user can send multiple parallel requests using the same coupon. 

  Fix the Race Condtion in coupon redemption
