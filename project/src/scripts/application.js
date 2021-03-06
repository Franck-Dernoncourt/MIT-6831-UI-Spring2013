// Generated by CoffeeScript 1.6.2
(function() {
  var Dose, DoseRowView, Patient, PatientDocumentView, PatientList, PatientListItemView, PatientListView, Prescription, User, allUsers, currentUser, franck, kamran, medications, mohammad, ratched, robin, sortByBed, sortByName, sortByUrgency, strangelove, testPatients, titles, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  titles = {
    doctor: "Dr.",
    nurse: "Nurse"
  };

  User = (function(_super) {
    __extends(User, _super);

    function User() {
      _ref = User.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    User.prototype.defaults = {
      name: "",
      title: titles.nurse,
      user_id: null
    };

    return User;

  })(Backbone.Model);

  strangelove = new User({
    name: "Strangelove",
    title: titles.doctor,
    user_id: 0
  });

  ratched = new User({
    name: "Ratched",
    title: titles.nurse,
    user_id: 1
  });

  allUsers = [strangelove, ratched];

  currentUser = strangelove;

  Prescription = (function(_super) {
    __extends(Prescription, _super);

    function Prescription() {
      _ref1 = Prescription.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Prescription.prototype.defaults = {
      medication: "",
      dosage: "",
      interval: null,
      startTime: moment(),
      endTime: moment(),
      deleteTime: null,
      allergyAlert: false,
      allergyWarning: false
    };

    Prescription.prototype.initialize = function() {
      var time, _results;

      this.set('doses', []);
      time = this.get('startTime').clone();
      _results = [];
      while (time <= this.get('endTime')) {
        this.get('doses').push(new Dose({
          prescription: this,
          scheduledTime: time.clone(),
          givenTime: null
        }));
        _results.push(time.add(this.get('interval')));
      }
      return _results;
    };

    return Prescription;

  })(Backbone.Model);

  Dose = (function(_super) {
    __extends(Dose, _super);

    function Dose() {
      _ref2 = Dose.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Dose.prototype.defaults = {
      prescription: null,
      scheduledTime: null,
      givenTime: null,
      allergyAlert: false,
      allergyWarning: false
    };

    Dose.prototype.given = function() {
      return this.get('givenTime') !== null;
    };

    return Dose;

  })(Backbone.Model);

  Patient = (function(_super) {
    __extends(Patient, _super);

    function Patient() {
      _ref3 = Patient.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Patient.prototype.defaults = {
      name: "Anonymous",
      age: 0,
      sex: "",
      ethnicity: "",
      address: "",
      importantAllergies: [],
      allergies: [],
      history: [],
      otherMedications: [],
      visitInformation: [],
      prescriptions: [],
      dosages: [],
      bed: 0,
      portraitFilename: ""
    };

    Patient.prototype.firstName = function() {
      return this.get('name').split(" ")[0];
    };

    Patient.prototype.lastName = function() {
      return this.get('name').split(" ")[1];
    };

    Patient.prototype.doses = function() {
      var dose, doses, prescription;

      doses = _.flatten([
        (function() {
          var _i, _len, _ref4, _results;

          _ref4 = this.get('prescriptions');
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            prescription = _ref4[_i];
            _results.push([
              (function() {
                var _j, _len1, _ref5, _results1;

                _ref5 = prescription.get('doses');
                _results1 = [];
                for (_j = 0, _len1 = _ref5.length; _j < _len1; _j++) {
                  dose = _ref5[_j];
                  if ((dose.get('givenTime') !== null) || (prescription.get('deleteTime') === null)) {
                    _results1.push(dose);
                  }
                }
                return _results1;
              })()
            ]);
          }
          return _results;
        }).call(this)
      ]);
      return _.sortBy(doses, function(dose) {
        return dose.get('scheduledTime');
      });
    };

    Patient.prototype.mostRecentDoseGiven = function() {
      var givenDoses;

      givenDoses = _.filter(this.doses(), function(dose) {
        return dose.given();
      });
      if (givenDoses.length > 0) {
        return givenDoses[givenDoses.length - 1];
      } else {
        return null;
      }
    };

    Patient.prototype.giveAllPastDoses = function() {
      var dose, _i, _len, _ref4, _results;

      _ref4 = this.doses();
      _results = [];
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        dose = _ref4[_i];
        if (dose.get('scheduledTime') < moment()) {
          _results.push(dose.set('givenTime', dose.get('scheduledTime')));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Patient.prototype.numUpcomingDoses = function() {
      return _.filter(this.doses(), function(dose) {
        return !dose.given();
      }).length;
    };

    Patient.prototype.nextDose = function() {
      var nextDoses;

      nextDoses = _.filter(this.doses(), function(dose) {
        return !dose.given();
      });
      if (nextDoses.length > 0) {
        return nextDoses[0];
      } else {
        return null;
      }
    };

    Patient.prototype.status = function() {
      if (this.nextDose() === null || this.nextDose().get('scheduledTime') > moment().add(5, 'minutes')) {
        return 'ok';
      } else if (this.nextDose().get('scheduledTime') > moment()) {
        return 'warning';
      } else {
        return 'alert';
      }
    };

    return Patient;

  })(Backbone.Model);

  PatientList = (function(_super) {
    __extends(PatientList, _super);

    function PatientList() {
      _ref4 = PatientList.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    PatientList.prototype.localStorage = new Backbone.LocalStorage("patients");

    PatientList.prototype.model = Patient;

    return PatientList;

  })(Backbone.Collection);

  PatientListView = (function(_super) {
    __extends(PatientListView, _super);

    function PatientListView() {
      _ref5 = PatientListView.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    PatientListView.prototype.el = $('#patients');

    PatientListView.prototype.initialize = function() {
      _.bindAll(this);
      this.collection = new PatientList;
      this.collection.bind('add', this.appendPatient);
      return this.patientListItemViews = [];
    };

    PatientListView.prototype.rerender = function(user) {
      var patientListItemView, _i, _len, _ref6;

      _ref6 = this.patientListItemViews;
      for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
        patientListItemView = _ref6[_i];
        patientListItemView.rerender(user);
      }
      return this;
    };

    PatientListView.prototype.appendPatient = function(patient) {
      var patientListItemView;

      patientListItemView = new PatientListItemView({
        model: patient
      });
      this.patientListItemViews.push(patientListItemView);
      return $(this.el).append(patientListItemView.render(currentUser).el);
    };

    return PatientListView;

  })(Backbone.View);

  PatientListItemView = (function(_super) {
    __extends(PatientListItemView, _super);

    function PatientListItemView() {
      _ref6 = PatientListItemView.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    PatientListItemView.prototype.tagName = 'li';

    PatientListItemView.prototype.initialize = function() {
      $(this.el).data('patient', this.model);
      return this.doseRowViews = [];
    };

    PatientListItemView.prototype.render = function(user) {
      $(this.el).html(_.template($("#list-item-template").html(), {
        patient: this.model
      }));
      this.user = user;
      this.rerender(user);
      return this;
    };

    PatientListItemView.prototype.rerender = function(user) {
      var dose, doseRowView, _i, _len, _ref7;

      $(this.el).find('.doses tbody').empty();
      _ref7 = this.model.doses();
      for (_i = 0, _len = _ref7.length; _i < _len; _i++) {
        dose = _ref7[_i];
        doseRowView = new DoseRowView({
          model: dose
        });
        this.doseRowViews.push(doseRowView);
        $(this.el).find('.doses tbody').append(doseRowView.render().el);
      }
      $(this.el).find(".add-prescription-button").html(_.template($("#add-prescription-button-template").html(), {
        isDoctor: user.attributes.title === titles.doctor
      }));
      $(this.el).find(".listing").html(_.template($("#patient-listing-template").html(), {
        patient: this.model
      }));
      $(this.el).find(".administration-list").html(_.template($("#administration-list-template").html(), {
        patient: this.model
      }));
      $(this.el).find(".prescriptions-list").html(_.template($("#prescriptions-list-template").html(), {
        patient: this.model
      }));
      $(this.el).find(".prescription .prescriptions tbody tr:not(.new)").remove();
      $(this.el).find(".prescription .prescriptions tbody").prepend(_.template($("#prescriptions-table-template").html(), {
        patient: this.model,
        isDoctor: user.attributes.title === titles.doctor
      }));
      this.setNextDose();
      return this;
    };

    PatientListItemView.prototype.setNextDose = function() {
      if (this.model.nextDose()) {
        return $(this.el).data('next-dose', this.model.nextDose().get('scheduledTime').valueOf());
      } else {
        return $(this.el).data('next-dose', null);
      }
    };

    PatientListItemView.prototype.removePrescription = function(event) {
      var $tr, prescriptionIndex;

      $tr = $(event.target).parents("tr");
      prescriptionIndex = $tr.index();
      this.model.get('prescriptions')[prescriptionIndex].set({
        'deleteTime': moment()
      });
      return this.rerender(this.user);
    };

    PatientListItemView.prototype.undoRemove = function(event) {
      var $tr, prescriptionIndex;

      $tr = $(event.target).parents("tr");
      prescriptionIndex = $tr.index();
      this.model.get('prescriptions')[prescriptionIndex].set({
        'deleteTime': null
      });
      return this.rerender(this.user);
    };

    PatientListItemView.prototype.addPrescription = function(event) {
      var $tr;

      $tr = $(event.target).parents("tr");
      this.model.get('prescriptions').push(new Prescription({
        medication: $tr.find(".medication-input").val(),
        dosage: $tr.find(".dosage-input").val(),
        interval: moment.duration(parseInt($tr.find(".frequency-input").val(), 10), 'hours'),
        startTime: moment($tr.find(".start-input input").val()),
        endTime: moment($tr.find(".end-input input").val()),
        allergyAlert: _.contains(_.map(this.model.get('importantAllergies'), function(x) {
          return x.toLowerCase();
        }), $tr.find(".medication-input").val().toLowerCase()),
        allergyWarning: _.contains(_.map(this.model.get('allergies'), function(x) {
          return x.toLowerCase();
        }), $tr.find(".medication-input").val().toLowerCase())
      }));
      $tr.remove();
      return this.rerender(this.user);
    };

    PatientListItemView.prototype.events = {
      'click .remove-existing': 'removePrescription',
      'click .add-new': 'addPrescription',
      'click .undo-link': 'undoRemove'
    };

    return PatientListItemView;

  })(Backbone.View);

  PatientDocumentView = (function(_super) {
    __extends(PatientDocumentView, _super);

    function PatientDocumentView() {
      _ref7 = PatientDocumentView.__super__.constructor.apply(this, arguments);
      return _ref7;
    }

    PatientDocumentView.prototype.el = $('#patient-document');

    PatientDocumentView.prototype.renderPatient = function(patient) {
      $(this.el).html(_.template($("#patient-document-template").html(), {
        patient: patient
      }));
      return this;
    };

    PatientDocumentView.prototype.render = function(user, allUsers) {
      console.log('rendering doc view:');
      console.log(user);
      $("#user-name-header").html(_.template($("#user-name-header-template").html(), {
        activeUser: user,
        allUsers: allUsers
      }));
      return this;
    };

    return PatientDocumentView;

  })(Backbone.View);

  DoseRowView = (function(_super) {
    __extends(DoseRowView, _super);

    function DoseRowView() {
      _ref8 = DoseRowView.__super__.constructor.apply(this, arguments);
      return _ref8;
    }

    DoseRowView.prototype.tagName = 'tr';

    DoseRowView.prototype.render = function() {
      $(this.el).html(_.template($("#dose-row-template").html(), {
        dose: this.model
      }));
      if (this.model.given()) {
        $(this.el).addClass('done');
      } else {
        $(this.el).removeClass('done');
      }
      return this;
    };

    DoseRowView.prototype.done = function() {
      this.model.set('givenTime', moment());
      return this.render();
    };

    DoseRowView.prototype.undo = function() {
      this.model.set('givenTime', null);
      return this.render();
    };

    DoseRowView.prototype.remove = function() {
      return $(this.el).remove();
    };

    DoseRowView.prototype.events = {
      'click .done': 'done',
      'click .undo': 'undo'
    };

    return DoseRowView;

  })(Backbone.View);

  medications = ["Abilify", "Accutane", "Actonel", "Adderall", "Adipex", "Advair", "Allegra", "Ambien", "Amitiza", "Arava", "Aricept", "Aspirin", "Avodart", "Boniva", "Botox", "Byetta", "Carvedilol", "Celebrex", "Celexa", "Chantix", "Cialis", "Cimzia", "Ciprofloxacin", "Claritin", "Clomid", "Coumadin", "Crestor", "Cyclobenzaprine", "Cymbalta", "Dexamethasone", "Dilaudid", "Diovan", "Diphenhydramine", "Dopamine", "Effexor", "Enbrel", "Ephedrine", "Femara", "Fish Oil", "Flomax", "Folic Acid", "Fosamax", "Gabapentin", "Gardasil", "Geodon", "Humira", "Hydrocodone", "Insulin", "Keppra", "Lamictal", "Lasix", "Levaquin", "Levitra", "Lexapro", "Lipitor", "Lisinopril", "Lithium", "Loratadine", "Losartan", "Lotrel", "Losartan", "Lunesta", "Lyrica", "Melatonin", "Meloxicam", "Metformin", "Methadone", "Methotrexate", "Mirapex", "Mirena", "Mirtazapine", "Namenda", "Naproxen", "Nasonex", "Neurontin", "Nexium", "Nizoral", "Norco", "Norvasc", "Omeprazole", "Orencia", "Oxycodone", "Oxycontin", "Pantoprazole", "Paxil", "Paracetamol", "Penicillin", "Percocet", "Phentermine", "Plan B", "Plavix", "Pravastatin", "Prednisone", "Prevacid", "Prilosec", "Promethazine", "Propecia", "Protonix", "Provigil", "Prozac", "Pulmicort", "Remicade", "Rituxan", "Senna", "Seroquel", "Sertraline", "Simvastatin", "Singulair", "Soma", "Spiriva", "Suboxone", "Synvisc", "Tamiflu", "Tamoxifen", "Tamsulosin", "Taxol", "Testosterone", "Thyroid", "Topamax", "Tramadol", "Trazodone", "Tylenol", "Ultram", "Valtrex", "Viagra", "Vicodin", "Vimovo", "Voltaren", "Vytorin", "Wellbutrin", "Xanax", "Xenical", "Zetia", "Zocor", "Zoloft", "Zyprexa", "Zyrtec"];

  kamran = new Patient({
    name: "Kamran Khan",
    age: 21,
    sex: "Male",
    ethnicity: "South Asian, White",
    address: "3 Ames St.,<br />Cambridge, MA. 02142",
    importantAllergies: [],
    allergies: ["pollen"],
    history: ["Family history of hypertension", "Family history of hyperglycemia", "Toncilectomy <em> 12 December 2008</em>"],
    otherMedications: ["Daily aspirin <em>100mg/day</em>"],
    visitInformation: ["Admitted with chest pain <em>2 days ago</em>", "In ICU after suspected cardiac arrest <em>14 hours ago</em>"],
    prescriptions: [
      new Prescription({
        medication: "Aspirin",
        dosage: "100mg",
        interval: moment.duration(1, 'hours'),
        startTime: moment().subtract(2, 'hours').add(2, 'minutes'),
        endTime: moment().add(1, 'hours').add(2, 'minutes')
      })
    ],
    bed: 3,
    portraitFilename: "kamran.jpg"
  });

  robin = new Patient({
    name: "Robin Deits",
    age: 23,
    sex: "Male",
    ethnicity: "White",
    address: "1 Main St.,<br />Cambridge, MA. 02142",
    importantAllergies: ["penicillin"],
    allergies: ["aspirin"],
    otherMedications: ["<em>Patient not on any other medications</em>"],
    visitInformation: ["Admitted with head trauma <em>1 day ago</em>", "In ICU after suspected cerebral hemorrhage <em>3 hours ago</em>"],
    history: ["Family history of hypertension"],
    prescriptions: [
      new Prescription({
        medication: "Morphine",
        dosage: "100mg",
        interval: moment.duration(2, 'hours'),
        startTime: moment().subtract(15, 'minutes'),
        endTime: moment().add(4, 'hours').subtract(15, 'minutes')
      })
    ],
    bed: 7,
    portraitFilename: "robin.jpg"
  });

  mohammad = new Patient({
    name: "Mohammad Ghassemi",
    age: 24,
    sex: "Male",
    ethnicity: "Middle Eastern, White",
    address: "100 Mass Ave.,<br />Cambridge, MA. 02139",
    importantAllergies: [],
    allergies: [],
    otherMedications: ["Daily Lipitor <em>35mg/day</em>", "Daily Catapres <em>50mg/day</em>"],
    visitInformation: ["Admitted with difficulty breathing <em>2 days ago</em>"],
    history: ["Family history of hypertension", "Appendectomy <em>5 May 2002</em>"],
    prescriptions: [
      new Prescription({
        medication: "Aspirin",
        dosage: "100mg",
        interval: moment.duration(1, 'hours'),
        startTime: moment().subtract(2, 'hours').add(11, 'minutes'),
        endTime: moment().add(4, 'hours').add(11, 'minutes')
      })
    ],
    bed: 5,
    portraitFilename: "mohammad.jpg"
  });

  franck = new Patient({
    name: "Franck Dernoncourt",
    age: 24,
    sex: "Male",
    ethnicity: "White",
    address: "120 Mass Ave.,<br />Cambridge, MA. 02139",
    importantAllergies: ["aspirin", "naproxen"],
    allergies: ["peanuts"],
    otherMedications: ["Daily Fenofibrate <em>45mg/day</em>", "Twice-daily Lovenox <em>20mg/day, 10mg q12h</em>"],
    visitInformation: ["Admitted with difficulty breathing <em>2 days ago</em>"],
    history: ["Family history of hyperglycemia"],
    prescriptions: [
      new Prescription({
        medication: "Morphine",
        dosage: "100mg",
        interval: moment.duration(2, 'hours'),
        startTime: moment().subtract(54, 'minutes'),
        endTime: moment().add(4, 'hours').subtract(54, 'minutes')
      }), new Prescription({
        medication: "Naproxen",
        dosage: "30mg",
        interval: moment.duration(24, 'hours'),
        startTime: moment().subtract(9, 'hours'),
        endTime: moment().add(6, 'days').subtract(9, 'hours'),
        allergyAlert: true
      })
    ],
    bed: 9,
    portraitFilename: "franck.jpg"
  });

  testPatients = [kamran, robin, franck, mohammad];

  franck.giveAllPastDoses();

  mohammad.giveAllPastDoses();

  kamran.giveAllPastDoses();

  sortByName = function() {
    var $list, listItems;

    $list = $("#patients");
    listItems = $list.children("li").get();
    listItems.sort(function(a, b) {
      var aVal, bVal;

      aVal = $(a).find("h2.name").text();
      bVal = $(b).find("h2.name").text();
      if (aVal < bVal) {
        return -1;
      }
      if (aVal > bVal) {
        return 1;
      }
      return 0;
    });
    return $list.append(listItems);
  };

  sortByBed = function() {
    var $list, listItems;

    $list = $("#patients");
    listItems = $list.children("li").get();
    listItems.sort(function(a, b) {
      var aVal, bVal;

      aVal = parseInt($(a).find(".bed-number").text(), 10);
      bVal = parseInt($(b).find(".bed-number").text(), 10);
      if (aVal < bVal) {
        return -1;
      }
      if (aVal > bVal) {
        return 1;
      }
      return 0;
    });
    return $list.append(listItems);
  };

  sortByUrgency = function() {
    var $list, listItems;

    $list = $("#patients");
    listItems = $list.children("li").get();
    listItems.sort(function(a, b) {
      var aVal, bVal;

      aVal = $(a).data("next-dose");
      bVal = $(b).data("next-dose");
      if (aVal < bVal) {
        return -1;
      }
      if (aVal > bVal) {
        return 1;
      }
      return 0;
    });
    return $list.append(listItems);
  };

  $(function() {
    var patient, patientDocumentView, patientListView, _i, _len;

    patientListView = new PatientListView;
    console.log(currentUser);
    if (patientListView.collection.length === 0) {
      for (_i = 0, _len = testPatients.length; _i < _len; _i++) {
        patient = testPatients[_i];
        patientListView.collection.create(patient);
      }
    }
    setInterval(function() {
      patientListView.rerender(currentUser);
      _.each(patientListView.collection.models, function(patient) {
        return patientListView.collection.sync('update', patient);
      });
      return console.log('.');
    }, 2000);
    sortByName();
    patientDocumentView = new PatientDocumentView;
    patientDocumentView.render(currentUser, allUsers);
    $("#sort-by-name").click(function(event) {
      event.stopPropagation();
      event.preventDefault();
      if ($(this).hasClass("active")) {
        return;
      }
      $("#sort-by-bed").removeClass("active");
      $("#sort-by-urgency").removeClass("active");
      $(this).addClass("active");
      return sortByName();
    });
    $("#sort-by-bed").click(function(event) {
      event.stopPropagation();
      event.preventDefault();
      if ($(this).hasClass("active")) {
        return;
      }
      $("#sort-by-name").removeClass("active");
      $("#sort-by-urgency").removeClass("active");
      $(this).addClass("active");
      return sortByBed();
    });
    $("#sort-by-urgency").click(function(event) {
      event.stopPropagation();
      event.preventDefault();
      if ($(this).hasClass("active")) {
        return;
      }
      $("#sort-by-bed").removeClass("active");
      $("#sort-by-name").removeClass("active");
      $(this).addClass("active");
      return sortByUrgency();
    });
    $(".account").click(function(event) {
      event.stopPropagation();
      event.preventDefault();
      if ($(this).hasClass("active")) {
        return;
      }
      $(".account").removeClass("active");
      $(this).addClass("active");
      currentUser = allUsers[$(this).attr('user_id')];
      return patientListView.rerender(currentUser);
    });
    $(document).on("click", ".not-implemented", {}, function(event) {
      event.stopPropagation();
      event.preventDefault();
      return $("#flash-message").stop().hide().slideDown(100).delay(1000).fadeOut(500);
    });
    $(document).on("click", ".input", {}, function(event) {
      event.stopPropagation();
      event.preventDefault();
      return $(this).find("input").focus();
    });
    $(document).on("click", ".remove-new", {}, function(event) {
      event.stopPropagation();
      event.preventDefault();
      return $(this).parents("tr").remove();
    });
    $(document).on("click", ".add-prescription", {}, function(event) {
      var $newRow, $table;

      event.stopPropagation();
      event.preventDefault();
      $table = $(this).parents(".prescription").find("table.prescriptions");
      $newRow = $table.find(".new-template").clone().removeClass("new-template");
      $newRow.find(".date-time-picker-input").datetimepicker({
        hourGrid: 4,
        minuteGrid: 10
      });
      $newRow.find(".date-time-picker-input").datetimepicker('setDate', new Date);
      $newRow.find(".medication-input").autocomplete({
        source: medications
      });
      return $newRow.appendTo($table.find("tbody")).hide().slideDown(200);
    });
    $(document).on("click", ".medication-tabs a", {}, function(event) {
      var tabName;

      if ($(this).hasClass("active")) {
        return;
      }
      $(this).parents(".medication-tabs").find("a").removeClass("active");
      $(this).addClass("active");
      tabName = $(this).data("tab");
      return $(this).parents(".medication").find(".medication-content > div").slideUp(100, function() {
        return $(this).filter("." + tabName).slideDown(100);
      });
    });
    $(document).on("click", ".listing", {}, function(event) {
      var $li;

      $(this).siblings(".medication").find(".medication-tabs a[data-tab=overview]").click();
      $li = $(this).parents("li");
      if ($li.hasClass("active")) {
        $li.removeClass("active");
        $li.find(".medication").slideUp(200);
        $("#add-patient").removeClass("secondary");
        return $("#patient-document").stop().slideUp(200, function() {
          return $("body").removeClass("patient-selected");
        });
      } else {
        $("#patients > li.active").removeClass("active");
        $("#patients > li .medication").slideUp(200);
        $li.addClass("active");
        $li.find(".medication").slideDown(200);
        $("body").addClass("patient-selected");
        $("#add-patient").addClass("secondary");
        return $("#patient-document").stop().fadeOut(100, function() {
          patientDocumentView.renderPatient($li.data('patient'));
          return $("#patient-document").fadeIn(300);
        });
      }
    });
    return $("#number-of-patients .count").text(testPatients.length);
  });

}).call(this);
