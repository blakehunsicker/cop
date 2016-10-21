function init() {

  // Get Firebase Database reference.
  var firepadRef = hashRef();
  console.log(firepadRef)

  function hashRef() {
    var ref = firebase.database().ref();
    var hash = window.location.hash.replace(/#/g, '');
    if (hash) {
      ref = ref.child(hash);
    } else {
      ref = ref.push(); // generate unique location.
      window.location = window.location + '#' + ref.key; // add it as a hash to the URL.
      console.log('ref in line 15 is: ' + ref);
    }
    if (typeof console !== 'undefined') {
      console.log('Firebase data: ', ref.toString());
    }
    return ref;
  }

  // Create CodeMirror (with lineWrapping on).
  var codeMirror = CodeMirror(document.getElementById('firepad'), {
    lineWrapping: true,
    lineNumbers: true
  });

  // Create Firepad (with rich text toolbar and shortcuts enabled).
  var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {
    richTextShortcuts: true,
    richTextToolbar: true,
    defaultText: 'Lisas presents'
  });

  // console.log('database default is ' + firebase.database().ref("chat"));

  // Get a reference to the Firebase Realtime Database
  var pathArray = window.location.hash.substr(1);
  var chatRef = firebase.database().ref(pathArray+'/chat');
  console.log('chatRef is '+chatRef);

  // Create an instance of Firechat
  var chat = new FirechatUI(chatRef, document.getElementById("firechat-wrapper"));

  // Listen for authentication state changes
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // If the user is logged in, set them as the Firechat user
      chat.setUser(user.uid, "Anonymous" + user.uid.substr(10, 8));
    } else {
      // If the user is not logged in, sign them in anonymously
      firebase.auth().signInAnonymously().catch(function(error) {
        console.log("Error signing user in anonymously:", error);
      });
    }
  });

    
  firepad.on('ready',function(){
    var room_messages = chatRef.child('room-messages');

    
    room_messages.on('child_added', function(room_id){
      // .orderByChild('timestamp').startAt(Date.now())
      var room_id_key = room_id.key;
      var messages = firebase.database().ref(pathArray+'/chat/room-messages/'+room_id_key);
      console.log('messages are '+messages);
      messages.limitToLast(1).on('child_added',function(message_id){
        console.log('yo');
        var message_id_key = message_id.key;
        var message_id_val = message_id.val;
  
        var lineCount = codeMirror.lineCount();
        var cursor = codeMirror.getCursor(); // gets the line number in the cursor position
        // var line = codeMirror.getLine(cursor.line); // get the line contents
        var line = codeMirror.lastLine();
        var pos = { // create a new object to avoid mutation of the original selection
          line: line,
          ch: line.length // set the character position to the end of the line
        }
        var message = message_id.child('message').val();
        codeMirror.replaceRange('\n'+message, pos); // adds a new line
      });
    });

  })
};
