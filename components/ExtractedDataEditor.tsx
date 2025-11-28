import React, { useState } from 'react';
import { InquiryData } from '../types';
import { FORM_LABELS, PRODUCT_TYPES, PURPOSE_GOALS, CERTIFICATIONS } from '../constants';
import Button from './common/Button';
import Card from './common/Card';
import Input from './common/Input';
import Select from './common/Select';
import TagInput from './common/TagInput';

interface ExtractedDataEditorProps {
  initialData: InquiryData;
  onSubmit: (data: InquiryData) => void;
  onBack: () => void;
}

const ExtractedDataEditor: React.FC<ExtractedDataEditorProps> = ({ initialData, onSubmit, onBack }) => {
  const [formData, setFormData] = useState<InquiryData>(initialData);

  // FIX: Constrain K to exclude 'source' and 'clientResearch' keys, as they are not FormFieldData objects.
  const handleChange = <K extends Exclude<keyof InquiryData, 'source' | 'clientResearch'>>(field: K, value: InquiryData[K]['value']) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], value },
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card title="抽出された情報を確認">
        <p className="mb-6 text-gray-600 bg-yellow-50 border border-yellow-200 p-3 rounded-md">
          AIが以下の情報を抽出しました。内容を確認・編集し、確定してください。黄色でハイライトされた項目はAIの確信度が低いため、特に注意してご確認ください。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {/* Column 1 */}
          <div>
            <Select 
              id="product_type"
              label={FORM_LABELS.product_type}
              options={PRODUCT_TYPES}
              value={formData.product_type.value}
              confidence={formData.product_type.confidence}
              onChange={(e) => handleChange('product_type', e.target.value)}
              required
            />
            <TagInput
              label={FORM_LABELS.purpose_goals}
              options={PURPOSE_GOALS}
              selectedOptions={formData.purpose_goals.value}
              confidence={formData.purpose_goals.confidence}
              onChange={(v) => handleChange('purpose_goals', v)}
            />
             <Input
              id="target_audience"
              label={FORM_LABELS.target_audience}
              value={formData.target_audience.value}
              confidence={formData.target_audience.confidence}
              onChange={(e) => handleChange('target_audience', e.target.value)}
            />
            <Input
              id="hero_ingredients_preference"
              label={FORM_LABELS.hero_ingredients_preference}
              value={formData.hero_ingredients_preference.value}
              confidence={formData.hero_ingredients_preference.confidence}
              onChange={(e) => handleChange('hero_ingredients_preference', e.target.value)}
            />
             <Input
              id="claims_must"
              label={FORM_LABELS.claims_must}
              value={formData.claims_must.value}
              confidence={formData.claims_must.confidence}
              onChange={(e) => handleChange('claims_must', e.target.value)}
            />
            <TagInput
              label={FORM_LABELS.certifications}
              options={CERTIFICATIONS}
              selectedOptions={formData.certifications.value}
              confidence={formData.certifications.confidence}
              onChange={(v) => handleChange('certifications', v)}
            />
            <Input
              id="allergens_restrictions"
              label={FORM_LABELS.allergens_restrictions}
              value={formData.allergens_restrictions.value}
              confidence={formData.allergens_restrictions.confidence}
              onChange={(e) => handleChange('allergens_restrictions', e.target.value)}
            />
             <Input
              id="brand_story_tone"
              label={FORM_LABELS.brand_story_tone}
              value={formData.brand_story_tone.value}
              confidence={formData.brand_story_tone.confidence}
              onChange={(e) => handleChange('brand_story_tone', e.target.value)}
            />
          </div>

          {/* Column 2 */}
          <div>
            <Input
              id="sensory"
              label={FORM_LABELS.sensory}
              value={formData.sensory.value}
              confidence={formData.sensory.confidence}
              onChange={(e) => handleChange('sensory', e.target.value)}
            />
            <Input
              id="markets"
              label={FORM_LABELS.markets}
              value={formData.markets.value}
              confidence={formData.markets.confidence}
              onChange={(e) => handleChange('markets', e.target.value)}
            />
            <Input
              id="lot_size"
              label={FORM_LABELS.lot_size}
              value={formData.lot_size.value}
              confidence={formData.lot_size.confidence}
              onChange={(e) => handleChange('lot_size', e.target.value)}
            />
            <Input
              id="budget_band"
              label={FORM_LABELS.budget_band}
              value={formData.budget_band.value}
              confidence={formData.budget_band.confidence}
              onChange={(e) => handleChange('budget_band', e.target.value)}
            />
            <Input
              id="lead_time_expectation"
              label={FORM_LABELS.lead_time_expectation}
              value={formData.lead_time_expectation.value}
              confidence={formData.lead_time_expectation.confidence}
              onChange={(e) => handleChange('lead_time_expectation', e.target.value)}
            />
            <Input
              id="package_preferences"
              label={FORM_LABELS.package_preferences}
              value={formData.package_preferences.value}
              confidence={formData.package_preferences.confidence}
              onChange={(e) => handleChange('package_preferences', e.target.value)}
            />
            <Input
              id="sustainability"
              label={FORM_LABELS.sustainability}
              value={formData.sustainability.value}
              confidence={formData.sustainability.confidence}
              onChange={(e) => handleChange('sustainability', e.target.value)}
            />
            <Input
              id="contact_info_internal"
              label={FORM_LABELS.contact_info_internal}
              value={formData.contact_info_internal.value}
              confidence={formData.contact_info_internal.confidence}
              onChange={(e) => handleChange('contact_info_internal', e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
          <Button type="button" variant="outline" onClick={onBack}>
            戻る
          </Button>
          <Button type="submit">
            確定して最適な提案を検索
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default ExtractedDataEditor;