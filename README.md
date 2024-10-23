todo
correct response codes in backend
dont send & remove sensitive feilds via .select() to specify what to omit or some other way where u define what to bring from db before sending user details to client side
have to implement winston logs
implement otp feature after which user decide whether they want otp or link in email

## future implementations

- Job Queues: If you're sending out a lot of emails (e.g., for user verification and password reset), it’s common to use job queues (e.g., Bull, RabbitMQ) to manage email sending tasks in the background instead of sending them synchronously.
