set -euo pipefail

function negatory {
    filename=$1
    expected=$(grep -e "// expected:" ${filename} | sed "s#.*// expected:[ ]*##g")
    if [[ "${expected}" == "" ]]; then
        npx tsc --noEmit --pretty false ${filename}
        echo "FAIL: expected a comment indicating what error is expected."
        exit 1
    fi
    (
        set +e +o pipefail
        message=$(npx tsc --noEmit --pretty false ${filename} 2>&1 | grep "${expected}")
        if [[ "${message}" == "" ]]; then
            echo "FAIL: expected error: ${expected}"
            exit 1
        else
            echo ${message} | sed "s/ error / success /g"
        fi
    )
}

find test -type f -name "*.positive.ts" \
    | xargs -n 1 -t npx tsc --noEmit

export -f negatory
find test -type f -name "*.negative.ts" \
    | xargs -n 1 -t -I FILE bash -c "negatory \"FILE\""
