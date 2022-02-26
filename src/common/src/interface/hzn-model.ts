export class RequiredService {
  org = '$HZN_ORG_ID';
  url = '$SERVICE_NAME';
  version = '$SERVICE_VERSION_RANGE_UPPER';
  versionRange = '$SERVICE_VERSION_RANGE_LOWER';
  arch = '$ARCH';

  constructor() {}
}

export class Container {
  name = '$SERVICE_NAME';
  image = 'SERVICE_CONTAINER';
  binds = ['$SHARED_VOLUME:$VOLUME_MOUNT:rw'];
  privileged = true;
  cap_add!: string[];
  devices!: string[];
}

export class Deployment {
  services!: Container;
}

export class Service {
  org = '$HZN_ORG_ID';
  url = '$SERVICE_NAME';
  version = '$SERVICE_VERSION';
  label = '$SERVICE_NAME for $ARCH';
  arch = '$ARCH';
  documentation = 'https://github.com/playground/open-labs/master/edge/services/helloworld/README.md';
  public = false;
  sharable = 'singleton';
  requiredServices!: RequiredService[];
  userInput!: any[];
  deployment!: Deployment; 
  source?: string;
  display?: string;
  owner?: string;
}