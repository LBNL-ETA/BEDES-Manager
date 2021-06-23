if [ -z "$SSH_CLIENT" ]; then
  # ensure $HOME is set
  export HOME=/heroku
  curl --fail --retry 3 -sSL "$HEROKU_EXEC_URL" -o $HOME/exec-script.sh

  # remove the condition around: echo "UsePrivilegeSeparation no" >> $HOME/.ssh/sshd_config
  # first get the line number that matches: if ssh -V 2>&1 | grep -q -e '^OpenSSH_7\.2.*$' -e '^OpenSSH_6\.6.*$'; then
  LINE_IF=$(grep -n "OpenSSH_" $HOME/exec-script.sh | cut -f1 -d:)
  LINE_FI=$(($LINE_IF + 2))
  sed -i.orig -e "${LINE_FI}d;${LINE_IF}d" $HOME/exec-script.sh

  source $HOME/exec-script.sh
fi
