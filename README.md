# DList - API
Best server list (with multicoloured rockets), like disboard.

**Website**: https://github.com/theADAMJR/DList

## Installation
1) Fork/download this respository
2) `npm i` to install packages

### Config
`config.json` example:
```
{
  "bot": {
    "token": "",
    "secret": "",
    "ownerId": "218459216145285121",
    "activity": "dlist.xyz",
    "id": "533947001578979328"
  },
  "api": {
    "url": "http://localhost:3000/api",
    "port": 3000,
    "supportInvite": "uDTgxyg"
  },
  "guild": {
    "id": "744166274028011561",
    "reportChannelId": "745252436976861224"
  },
  "dashboardURL": "http://localhost:4200",
  "mongoURL": "mongodb://localhost/DList"
}
```