# js

This folder contains JavaScript files for adding interactivity and logic to the frontend user interface.

# ajax.js

This file contains utility functions for making AJAX requests (GET and POST) to the backend API using the Fetch API. Import and use these functions in your frontend scripts to interact with your PHP backend efficiently.

**Example usage:**

```js
import { apiGet, apiPost } from '../js/ajax.js';

// GET example
apiGet('/backend/api/endpoint.php')
  .then(data => console.log(data))
  .catch(err => console.error(err));

// POST example
apiPost('/backend/api/endpoint.php', { key: 'value' })
  .then(data => console.log(data))
  .catch(err => console.error(err));
```