# Uploading files fails

Try again without a proxy (eg. nginx or apache).

If it works, your proxy configuration may have a request timeout or a body size limit set.
For example, NGINX has low default limits (with reason !). Namely ```send_timeout``` and ```client_max_body_size```.

# Help

For help, contact with through issues here: https://github.com/nherment/arkhaios/issues