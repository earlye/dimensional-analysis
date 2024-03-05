set -euo pipefail

if [[ ! -z "{INSIDE_EMACS:-}" ]]; then
    echo "Entering Directory \`$(pwd)'"
fi

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
        actual=$(npx tsc --noEmit --pretty false ${filename} 2>&1)
        message=$(echo "${actual}" | grep "${expected}")
        if [[ "${message}" == "" ]]; then
            echo "FAIL: expected error: ${expected}"
            echo "**** actual output: ****"
            echo "${actual}"
            exit 1
        else
            echo ${message} | sed "s/ error / success /g"
        fi
    )
}

export -f negatory
find test -type f -name "*.negative.ts" \
    | xargs -n 1 -t -I FILE bash -c "negatory \"FILE\""

find test -type f -name "*.positive.ts" \
    | xargs -n 1 -t npx tsc --noEmit
