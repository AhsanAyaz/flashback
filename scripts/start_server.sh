#!/bin/bash
pm2 start npm --name "flashback" -- run start:prod
