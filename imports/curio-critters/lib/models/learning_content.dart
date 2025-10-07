class LearningContent {
  final String id;
  final String title;
  final String description;
  final String subject;
  final String content;
  final List<String> activities;
  final List<String> funFacts;
  final List<String> learningObjectives;
  final int targetAge;
  final DateTime createdAt;
  final String? imageUrl;
  final String? videoUrl;
  final Map<String, dynamic> metadata;

  const LearningContent({
    required this.id,
    required this.title,
    required this.description,
    required this.subject,
    required this.content,
    required this.activities,
    required this.funFacts,
    required this.learningObjectives,
    required this.targetAge,
    required this.createdAt,
    this.imageUrl,
    this.videoUrl,
    this.metadata = const {},
  });

  LearningContent copyWith({
    String? title,
    String? description,
    String? subject,
    String? content,
    List<String>? activities,
    List<String>? funFacts,
    List<String>? learningObjectives,
    int? targetAge,
    String? imageUrl,
    String? videoUrl,
    Map<String, dynamic>? metadata,
  }) {
    return LearningContent(
      id: id,
      title: title ?? this.title,
      description: description ?? this.description,
      subject: subject ?? this.subject,
      content: content ?? this.content,
      activities: activities ?? this.activities,
      funFacts: funFacts ?? this.funFacts,
      learningObjectives: learningObjectives ?? this.learningObjectives,
      targetAge: targetAge ?? this.targetAge,
      createdAt: createdAt,
      imageUrl: imageUrl ?? this.imageUrl,
      videoUrl: videoUrl ?? this.videoUrl,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'subject': subject,
      'content': content,
      'activities': activities,
      'funFacts': funFacts,
      'learningObjectives': learningObjectives,
      'targetAge': targetAge,
      'createdAt': createdAt.toIso8601String(),
      'imageUrl': imageUrl,
      'videoUrl': videoUrl,
      'metadata': metadata,
    };
  }

  factory LearningContent.fromJson(Map<String, dynamic> json) {
    return LearningContent(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      subject: json['subject'],
      content: json['content'],
      activities: List<String>.from(json['activities'] ?? []),
      funFacts: List<String>.from(json['funFacts'] ?? []),
      learningObjectives: List<String>.from(json['learningObjectives'] ?? []),
      targetAge: json['targetAge'],
      createdAt: DateTime.parse(json['createdAt']),
      imageUrl: json['imageUrl'],
      videoUrl: json['videoUrl'],
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
    );
  }
}