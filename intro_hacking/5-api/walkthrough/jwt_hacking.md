## JWT hacking to beccome admin
- This is your first hacking lab, you didn't learn how to crack passwords and secrets, ask your instructor what is the secret or use hashcat as described below
- After you get the secret construct the admin JWT. You can use the python script: 

  jwt/prepare_jwt.py
- Use Postman / Burp / Swagger to log in as admin

### How to crack a JWT secret
- Download dictionary: https://github.com/wallarm/jwt-secrets/blob/master/jwt.secrets.list
- Ran hashcat

```
hashcat -m 16500 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjM0NzQ4NzYsImlhdCI6MTc2MzQ3NDgxNiwic3ViIjoic3VwZXJnaXJsIn0.ExfWvqQK85Ufnt6f22Q0FvdmcZjIggFTtIpo2AlXKVg ../../../../../../Downloads/jwt.secrets.list
```



