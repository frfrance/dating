export type ExtraFieldType = 'select' | 'text' | 'textarea'

export type ExtraFieldOption = {
  value: string
  label: string
}

export type ExtraProfileField = {
  key: string
  label: string
  type: ExtraFieldType
  group: string
  onboardingRequired?: boolean
  placeholder?: string
  options?: ExtraFieldOption[]
}

const yesNoOptions: ExtraFieldOption[] = [
  { value: 'yes', label: 'Có' },
  { value: 'no', label: 'Không' },
  { value: 'sometimes', label: 'Thỉnh thoảng' },
]

export const EXTRA_PROFILE_FIELDS: ExtraProfileField[] = [
  {
    key: 'smoking_status',
    label: 'Bạn có hút thuốc không?',
    type: 'select',
    group: 'Lối sống',
    onboardingRequired: true,
    options: [
      { value: 'no', label: 'Không' },
      { value: 'sometimes', label: 'Thỉnh thoảng' },
      { value: 'yes', label: 'Có' },
    ],
  },
  {
    key: 'alcohol_status',
    label: 'Bạn có uống rượu không?',
    type: 'select',
    group: 'Lối sống',
    onboardingRequired: true,
    options: [
      { value: 'no', label: 'Không' },
      { value: 'sometimes', label: 'Thỉnh thoảng' },
      { value: 'yes', label: 'Có' },
    ],
  },
  {
    key: 'personality_type',
    label: 'Bạn là người hướng nội hay hướng ngoại?',
    type: 'select',
    group: 'Lối sống',
    onboardingRequired: true,
    options: [
      { value: 'introvert', label: 'Hướng nội' },
      { value: 'extrovert', label: 'Hướng ngoại' },
      { value: 'ambivert', label: 'Cân bằng / linh hoạt' },
    ],
  },
  {
    key: 'living_style',
    label: 'Bạn sống gọn gàng hay thoải mái, tự do?',
    type: 'select',
    group: 'Lối sống',
    options: [
      { value: 'tidy', label: 'Gọn gàng' },
      { value: 'balanced', label: 'Cân bằng' },
      { value: 'free', label: 'Thoải mái, tự do' },
    ],
  },
  {
    key: 'exercise_frequency',
    label: 'Bạn có thường xuyên tập thể thao không?',
    type: 'select',
    group: 'Lối sống',
    onboardingRequired: true,
    options: [
      { value: 'never', label: 'Hiếm khi' },
      { value: 'sometimes', label: 'Thỉnh thoảng' },
      { value: 'often', label: 'Thường xuyên' },
    ],
  },
  {
    key: 'vegetarian_status',
    label: 'Bạn có ăn chay không?',
    type: 'select',
    group: 'Lối sống',
    options: [
      { value: 'no', label: 'Không' },
      { value: 'sometimes', label: 'Thỉnh thoảng' },
      { value: 'yes', label: 'Có' },
    ],
  },
  {
    key: 'has_pets',
    label: 'Bạn có thú cưng không?',
    type: 'select',
    group: 'Thú cưng',
    onboardingRequired: true,
    options: yesNoOptions,
  },
  {
    key: 'loves_animals',
    label: 'Bạn có yêu động vật không?',
    type: 'select',
    group: 'Thú cưng',
    onboardingRequired: true,
    options: yesNoOptions,
  },
  {
    key: 'pet_hair_allergy',
    label: 'Bạn có bị dị ứng lông thú không?',
    type: 'select',
    group: 'Thú cưng',
    options: yesNoOptions,
  },
  {
    key: 'want_pets_future',
    label: 'Bạn có muốn sống cùng thú cưng trong tương lai không?',
    type: 'select',
    group: 'Thú cưng',
    options: yesNoOptions,
  },
  {
    key: 'living_situation',
    label: 'Bạn đang sống một mình hay ở ghép?',
    type: 'select',
    group: 'Hoàn cảnh hiện tại',
    onboardingRequired: true,
    options: [
      { value: 'alone', label: 'Sống một mình' },
      { value: 'shared', label: 'Ở ghép' },
      { value: 'family', label: 'Sống cùng gia đình' },
    ],
  },
  {
    key: 'previous_family_status',
    label: 'Bạn đã từng có gia đình chưa?',
    type: 'select',
    group: 'Hoàn cảnh hiện tại',
    options: [
      { value: 'no', label: 'Chưa' },
      { value: 'yes', label: 'Đã từng' },
      { value: 'prefer_not', label: 'Không muốn trả lời' },
    ],
  },
  {
    key: 'has_children',
    label: 'Bạn đã từng có con chưa?',
    type: 'select',
    group: 'Hoàn cảnh hiện tại',
    options: [
      { value: 'no', label: 'Chưa' },
      { value: 'yes', label: 'Có' },
      { value: 'prefer_not', label: 'Không muốn trả lời' },
    ],
  },
  {
    key: 'work_or_study_status',
    label: 'Bạn đang học hay đi làm?',
    type: 'select',
    group: 'Hoàn cảnh hiện tại',
    options: [
      { value: 'working', label: 'Đi làm' },
      { value: 'studying', label: 'Đang học' },
      { value: 'both', label: 'Vừa học vừa làm' },
      { value: 'other', label: 'Khác' },
    ],
  },
  {
    key: 'job_field',
    label: 'Công việc của bạn thuộc lĩnh vực nào?',
    type: 'text',
    group: 'Hoàn cảnh hiện tại',
    placeholder: 'Ví dụ: IT, y tế, giáo dục...',
  },
  {
    key: 'stay_in_germany_status',
    label: 'Bạn đang sống lâu dài ở Đức hay tạm thời?',
    type: 'select',
    group: 'Hoàn cảnh hiện tại',
    options: [
      { value: 'long_term', label: 'Lâu dài' },
      { value: 'temporary', label: 'Tạm thời' },
      { value: 'unsure', label: 'Chưa chắc chắn' },
    ],
  },
  {
    key: 'time_in_current_city',
    label: 'Bạn ở thành phố hiện tại bao lâu rồi?',
    type: 'text',
    group: 'Hoàn cảnh hiện tại',
    placeholder: 'Ví dụ: 2 năm',
  },
  {
    key: 'mobility_lifestyle',
    label: 'Bạn thường di chuyển nhiều hay ổn định một chỗ?',
    type: 'select',
    group: 'Hoàn cảnh hiện tại',
    options: [
      { value: 'stable', label: 'Ổn định một chỗ' },
      { value: 'sometimes_move', label: 'Thỉnh thoảng di chuyển' },
      { value: 'move_often', label: 'Di chuyển nhiều' },
    ],
  },
  {
    key: 'relationship_goal',
    label: 'Bạn đang tìm điều gì?',
    type: 'select',
    group: 'Mục tiêu hẹn hò',
    onboardingRequired: true,
    options: [
      { value: 'serious', label: 'Nghiêm túc' },
      { value: 'long_term', label: 'Tìm hiểu lâu dài' },
      { value: 'casual', label: 'Hẹn hò nhẹ nhàng' },
      { value: 'friends_first', label: 'Kết bạn trước' },
    ],
  },
  {
    key: 'marriage_intent',
    label: 'Bạn muốn kết hôn trong tương lai không?',
    type: 'select',
    group: 'Mục tiêu hẹn hò',
    options: yesNoOptions,
  },
  {
    key: 'wants_children',
    label: 'Bạn có muốn có con không?',
    type: 'select',
    group: 'Mục tiêu hẹn hò',
    options: yesNoOptions,
  },
  {
    key: 'ready_serious_relationship',
    label: 'Bạn có đang sẵn sàng cho mối quan hệ nghiêm túc không?',
    type: 'select',
    group: 'Mục tiêu hẹn hò',
    options: yesNoOptions,
  },
  {
    key: 'relationship_pace',
    label: 'Bạn thích tiến chậm hay nhanh trong chuyện tình cảm?',
    type: 'select',
    group: 'Mục tiêu hẹn hò',
    options: [
      { value: 'slow', label: 'Chậm' },
      { value: 'balanced', label: 'Tự nhiên, cân bằng' },
      { value: 'fast', label: 'Nhanh' },
    ],
  },
  {
    key: 'long_distance_ok',
    label: 'Bạn có yêu xa được không?',
    type: 'select',
    group: 'Mục tiêu hẹn hò',
    onboardingRequired: true,
    options: yesNoOptions,
  },
  {
    key: 'relocate_for_love',
    label: 'Bạn có sẵn sàng chuyển thành phố/quốc gia vì tình yêu không?',
    type: 'select',
    group: 'Mục tiêu hẹn hò',
    options: yesNoOptions,
  },
  {
    key: 'partner_requirements',
    label: 'Bạn có yêu cầu gì đặc biệt ở đối phương không?',
    type: 'textarea',
    group: 'Kỳ vọng ở đối phương',
    placeholder: 'Viết ngắn gọn điều bạn mong đợi...',
  },
  {
    key: 'relationship_priority',
    label: 'Điều gì là quan trọng nhất với bạn trong một mối quan hệ?',
    type: 'text',
    group: 'Kỳ vọng ở đối phương',
    placeholder: 'Ví dụ: sự chân thành',
  },
  {
    key: 'preferred_partner_type',
    label: 'Bạn thích kiểu người như thế nào?',
    type: 'textarea',
    group: 'Kỳ vọng ở đối phương',
  },
  {
    key: 'incompatible_partner_type',
    label: 'Bạn không hợp với kiểu người nào?',
    type: 'textarea',
    group: 'Kỳ vọng ở đối phương',
  },
  {
    key: 'values_most',
    label: 'Bạn coi trọng điều gì hơn?',
    type: 'select',
    group: 'Kỳ vọng ở đối phương',
    options: [
      { value: 'appearance', label: 'Ngoại hình' },
      { value: 'personality', label: 'Tính cách' },
      { value: 'stability', label: 'Sự ổn định' },
      { value: 'intelligence', label: 'Trí tuệ' },
      { value: 'humor', label: 'Hài hước' },
      { value: 'kindness', label: 'Tử tế' },
    ],
  },
  {
    key: 'red_flags',
    label: 'Điều gì là “red flag” với bạn?',
    type: 'textarea',
    group: 'Kỳ vọng ở đối phương',
  },
  {
    key: 'love_language_feeling',
    label: 'Điều gì khiến bạn cảm thấy được yêu thương?',
    type: 'textarea',
    group: 'Kỳ vọng ở đối phương',
  },
  {
    key: 'vietnam_hometown',
    label: 'Bạn đến từ đâu ở Việt Nam?',
    type: 'text',
    group: 'Bản sắc cá nhân',
    onboardingRequired: true,
    placeholder: 'Ví dụ: Hà Nội, Đà Nẵng...',
  },
  {
    key: 'religion',
    label: 'Bạn có theo tôn giáo nào không?',
    type: 'text',
    group: 'Bản sắc cá nhân',
    placeholder: 'Ví dụ: Công giáo, Phật giáo...',
  },
  {
    key: 'faith_importance',
    label: 'Đức tin có quan trọng với bạn không?',
    type: 'select',
    group: 'Bản sắc cá nhân',
    options: [
      { value: 'not_important', label: 'Không quá quan trọng' },
      { value: 'somewhat', label: 'Khá quan trọng' },
      { value: 'very_important', label: 'Rất quan trọng' },
    ],
  },
  {
    key: 'life_preference',
    label: 'Bạn thích cuộc sống yên bình hay nhiều trải nghiệm?',
    type: 'select',
    group: 'Bản sắc cá nhân',
    options: [
      { value: 'peaceful', label: 'Yên bình' },
      { value: 'balanced', label: 'Cân bằng' },
      { value: 'adventurous', label: 'Nhiều trải nghiệm' },
    ],
  },
  {
    key: 'live_near_family',
    label: 'Bạn có muốn sống gần gia đình sau này không?',
    type: 'select',
    group: 'Bản sắc cá nhân',
    options: yesNoOptions,
  },
  {
    key: 'need_personal_space',
    label: 'Bạn có cần nhiều không gian riêng không?',
    type: 'select',
    group: 'Giao tiếp & cảm xúc',
    options: yesNoOptions,
  },
  {
    key: 'handle_conflict_style',
    label: 'Bạn xử lý mâu thuẫn bằng cách nào?',
    type: 'textarea',
    group: 'Giao tiếp & cảm xúc',
  },
  {
    key: 'clarity_or_natural',
    label: 'Bạn thích sự rõ ràng hay tự nhiên?',
    type: 'select',
    group: 'Giao tiếp & cảm xúc',
    options: [
      { value: 'clarity', label: 'Rõ ràng' },
      { value: 'balanced', label: 'Cân bằng' },
      { value: 'natural', label: 'Tự nhiên' },
    ],
  },
  {
    key: 'jealousy_level',
    label: 'Bạn có hay ghen không?',
    type: 'select',
    group: 'Giao tiếp & cảm xúc',
    options: [
      { value: 'low', label: 'Ít' },
      { value: 'medium', label: 'Vừa phải' },
      { value: 'high', label: 'Nhiều' },
    ],
  },
  {
    key: 'private_or_public_relationship',
    label: 'Bạn thích một mối quan hệ riêng tư hay công khai?',
    type: 'select',
    group: 'Giao tiếp & cảm xúc',
    options: [
      { value: 'private', label: 'Riêng tư' },
      { value: 'balanced', label: 'Cân bằng' },
      { value: 'public', label: 'Công khai' },
    ],
  },
  {
    key: 'perfect_day',
    label: 'Một ngày hoàn hảo của bạn trông như thế nào?',
    type: 'textarea',
    group: 'Câu hỏi mở',
  },
  {
    key: 'cannot_live_without',
    label: 'Bạn không thể sống thiếu điều gì?',
    type: 'text',
    group: 'Câu hỏi mở',
  },
  {
    key: 'three_day_break_plan',
    label: 'Nếu có 3 ngày nghỉ, bạn sẽ làm gì?',
    type: 'textarea',
    group: 'Câu hỏi mở',
  },
]

export const ONBOARDING_REQUIRED_FIELDS = EXTRA_PROFILE_FIELDS.filter(
  (field) => field.onboardingRequired
)

export const ADVANCED_PROFILE_FIELDS = EXTRA_PROFILE_FIELDS.filter(
  (field) => !field.onboardingRequired
)