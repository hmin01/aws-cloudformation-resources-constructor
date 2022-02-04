# aws-cfn-constructor
Constructor for AWS CloudFormation resources using AWS CDK
(cfn is an abbreviation for cloudFormation)

---

## Installation
```sh
npm install aws-cfn-constructor
```

## Usage

### Javascript
```javascript
const cfnConstructor = require('aws-cfn-constructor');
// Load a configuration file to create role [Ref. AWS CloudFormation Doc]
const config = cfnConstructor.loadJsonFile("config_file_path");
// Create roles
cfnConstructor.createRoles(config);
```
```sh
Create the roles based on configuration
```
### TypeScript
```typescript
import { loadJsonFile, createRoles } from 'aws-cfn-constructor';
// Load a configuration file to create role [Ref. AWS CloudFormation Doc]
const config: any = loadJsonFile("config_file_path");
// Create roles
createRoles(config);
```
```sh
Create the roles based on configuration
```