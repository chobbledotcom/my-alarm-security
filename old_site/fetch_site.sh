#!/bin/bash

# Script to recursively fetch https://www.myalarmsecurity.co.uk/
# and save it locally with fixed links

echo "Starting recursive fetch of https://www.myalarmsecurity.co.uk/"
echo "This may take a while depending on the site size..."

wget \
    --recursive \
    --page-requisites \
    --html-extension \
    --convert-links \
    --restrict-file-names=windows \
    --domains myalarmsecurity.co.uk \
    --no-parent \
    --wait=1 \
    --random-wait \
    --user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
    --reject="*.exe,*.dmg,*.pkg,*.deb,*.rpm" \
    --directory-prefix=. \
    https://www.myalarmsecurity.co.uk/

echo "Fetch completed!"
echo "Files saved to: $(pwd)/www.myalarmsecurity.co.uk/"