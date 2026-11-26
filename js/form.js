var form = document.getElementById('contact-form');
if (form) {
  var messages = {
    name: 'Please enter your name.',
    email: 'That email address does not look right.',
    message: 'Please write at least 10 characters.'
  };

  function setFieldError(id, hasError) {
    var input = document.getElementById(id);
    var error = document.getElementById('error-' + id);
    if (hasError) {
      input.setAttribute('aria-invalid', 'true');
      if (error) error.textContent = messages[id];
      return false;
    }
    input.removeAttribute('aria-invalid');
    if (error) error.textContent = '';
    return true;
  }

  function validate() {
    var nameValue = document.getElementById('name').value.trim();
    var emailValue = document.getElementById('email').value.trim();
    var messageValue = document.getElementById('message').value.trim();

    var okName = setFieldError('name', nameValue.length === 0);
    var okEmail = setFieldError('email', !/^\S+@\S+\.\S+$/.test(emailValue));
    var okMessage = setFieldError('message', messageValue.length < 10);

    return okName && okEmail && okMessage;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (validate()) {
      document.getElementById('form-message').textContent = 'Thanks, we will get back to you.';
      form.reset();
    } else {
      document.getElementById('form-message').textContent = '';
    }
  });

  ['name', 'email', 'message'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      if (this.getAttribute('aria-invalid') === 'true') validate();
    });
  });
}
