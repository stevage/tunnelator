      function valorplaceholder (element) {
        if (element.val() != "")
          return element.val();
        else
          return element.attr("placeholder");
      }


      $("#soican-choices a").on("shown",function(e) {
        $("#soican-btn").html(e.target.text + '<b class="caret"></b>');
      });
      $("#tunnel-btn").on("click",function(e) {
        remotehost = valorplaceholder($("#remote-ip"));
        remoteport = valorplaceholder($("#remote-port"));
        remoteuser = $("#remote-user").val() + "@";
        if (remoteuser =="@")
          remoteuser = "";
        //remoteuser = valorplaceholder($("#remote-user"));
        targethost = valorplaceholder($(".tab-pane.active .target-ip"));
        targetport = valorplaceholder($(".tab-pane.active .target-port"));
        target2port = valorplaceholder($(".target2-port"));
        target2host = valorplaceholder($(".target2-ip"));
        tunnelhost = "localhost";
        tunnelport = Number(targetport) + 10000;
        
        remoteportparameter = "";
        if (remoteport != "22" && remoteport != "")
          remoteportparameter =  "-p " + remoteport + " ";
        activetab = $(".tab-pane.active")[0].id;
        switch(activetab) {
          case "soican-serverhere":
            targethost = "localhost";
            $("#local-code").text(
              "ssh -f -N " +
              remoteportparameter + 
              remoteuser + remotehost + " " + 
              "-L " + tunnelport + ":" + targethost + ":" + targetport);
            $("#local-step").show();
            $("#remote-step").hide();
            $("#using-step").html(
              '<span id="using-text">Browse to your web server like this: </span>' +
              '<code id="code-using">http://localhost:' + tunnelport + '</code>' 
              
              );
            $("#using-step").show();
            break;
          case "soican-email":
            tunnelport = 10000 + Number(targetport);
            tunnelport2 = 10000 + Number(target2port); 
            $("#local-step code").html(
              "ssh -f -N " +
              remoteportparameter +
              remoteuser + remotehost + " " + 
              "-L " + tunnelport + ":" + targethost + ":" + targetport + 
              "<br/>" +
              "ssh -f -N " +
              remoteportparameter + 
              remoteuser + remotehost + " " + 
              "-L " + tunnelport2 + ":" + target2host + ":" + target2port
              );
            $("#local-step").show();
            $("#remote-step").hide();
            $("#using-step").html(
              "Enter these values into your mail client:" +
              '<table class="table">' +
              "<tr><td>SMTP server</td><td> <code>localhost</code></td></tr>" +
              "<tr><td>SMTP port</td><td>  <code>" + tunnelport + "</code></td></tr>" +
              "<tr><td>POP/IMAP server</td><td>  <code>localhost</code></td></tr>" +
              "<tr><td>POP/IMAP port</td><td>  <code>" + tunnelport2 + "</code></td></tr>" +
              "</table>");
            $("#using-step").show();

            break;
          case "soican-web":
            bgoption = " -f ";
            remoteproxyport = valorplaceholder($("#remote-proxy-options .in .remote-proxy-port"));
            remotecmd = "";
            remotecmdoption = " -N "; // don't run command
            agentcmd = "";

            proxymode = $("#remote-proxy-options .in")[0].id;
            switch (proxymode) {
              case "remote-proxy-here":
                remoteproxyhost = "localhost";
                break;
              case "remote-proxy-near":
                remoteproxyhost = valorplaceholder($(".remote-proxy-ip"));
                break;
              case "remote-proxy-create":
                remoteproxyhost = "localhost";
                remoteproxyport = 8080;
                remotecmd = " ssh -D " + remoteproxyport + " " + remoteproxyhost;
                agentcmd = " -A -t "; // agent forwarding, create a shell
                remotecmdoption = ""
                bgoption = ""; // running in background makes it hard to stop and is messy.

                break;
            }
            
            tunnelport = 18080;
            $("#local-step code").html(
              "ssh " + 
              bgoption + 
              remotecmdoption + 
              agentcmd + 
              remoteportparameter +
              "-L " + tunnelport  + ":" + remoteproxyhost + ":" + remoteproxyport + " " +
              remoteuser + remotehost + " " +
              remotecmd

              );
            if (proxymode != "remote-proxy-create")
              proxyinstructions = 
                "Put this proxy setting in your browser:<br/>" +
                "<code>http://" + tunnelhost + ":" + tunnelport + "</code>";              
            else proxyinstructions =
              "Put this proxy setting in your browser:<br/>" +
               "SOCKS proxy: <code>" + tunnelhost + "</code><br/>" +
              "Port: <code>" + tunnelport + "</code>" +
              "<br/><br/>" + 
              "Try this on the command line: <br />" +
              "<code>curl --socks5 localhost:" + tunnelport + " google.com</code>";

            $("#using-step").html(proxyinstructions);

            $("#local-step").show();
            $("#remote-step").hide();
            $("#using-step").show();
 
            break;
          case "soican-shareweb":
            target1host = "localhost";
            target1port = 11080;
            localport = 1080;
            tunnelport = 11080;
            $("#local-step code").html(
              "ssh -f -N " +
              "-D " + localport + " " + "localhost" + 
              "<br />" +
              "ssh -R " + tunnelport + ":" + tunnelhost + ":" + localport + " " +
              remoteportparameter +
              remoteuser + remotehost              
            );
            $("#remote-step code").html(
              "export http_proxy=" + "http://" + tunnelhost + ":" + tunnelport + "<br/>" +
              "export https_proxy=" + "http://" + tunnelhost + ":" + tunnelport
              );
            $("#local-step").show();
            $("#remote-step").show();
            $("#using-step").hide();
            break;
          case "soican-hop":
            $("#local-code").html(
              // using the agent forwarding plus remote command method
              // lots of other possibilities
              // ##TODO add comment about ssh-add
              "# Add your private key to the agent. You only have to do this once, ever. <br/>"+
              "ssh-add ~/.ssh/my-private-key.pem <br />"+
              "ssh -A -t " +
              remoteportparameter + 
              remoteuser + remotehost + " " + 
              "ssh " +
              (targetport != "22" ? " -p " + targetport + " " : "") +
              targethost
              );
            $("#local-step").show();
            $("#remote-step").hide();
            $("#using-step").hide();
            break;
        }
        $("#output-container").fadeIn();
        return false;
      });
      $("#soican-choices a").on("shown", function(e) {
        $("#tunnel-btn").show();
        tab = $($(e.target).attr("href"))[0];
        switch(tab.id) {
          case "soican-web":
             $("#tunnel-btn").hide();
             $(".collapse.in").collapse("hide");
             break;
          case "soican-nothing":
            $("#tunnel-btn").hide();
        }
        $("#output-container").hide();
        return true;        
      });
      $(".accordion-body").on("hide", function() {
        $("#tunnel-btn").hide();
        return true;
      });
      $(".accordion-body").on("show", function() {
        $("#tunnel-btn").show();
        return true;
      });

     $('#helptext').popover(); // need to opt-in?
